const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface RequestOptions extends RequestInit {
    skipAuth?: boolean;
}

interface ApiResponse<T = any> {
    data: T;
    status: number;
    ok: boolean;
}

class ApiClient {
    private baseUrl: string;
    private accessToken: string | null = null;
    private refreshToken: string | null = null;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
        this.loadTokens();
    }

    /**
     * Load tokens from localStorage
     */
    private loadTokens(): void {
        this.accessToken = localStorage.getItem('accessToken');
        this.refreshToken = localStorage.getItem('refreshToken');
    }

    /**
     * Save tokens to localStorage
     */
    setTokens(accessToken: string, refreshToken: string): void {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
    }

    /**
     * Clear tokens on logout
     */
    clearTokens(): void {
        this.accessToken = null;
        this.refreshToken = null;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('tenant');
    }

    /**
     * Get decoded JWT payload
     */
    getTokenPayload(): any {
        if (!this.accessToken) return null;
        try {
            const base64Url = this.accessToken.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            return JSON.parse(window.atob(base64));
        } catch {
            return null;
        }
    }

    /**
     * Check if token is expired
     */
    isTokenExpired(): boolean {
        const payload = this.getTokenPayload();
        if (!payload) return true;
        return Date.now() >= payload.exp * 1000;
    }

    /**
     * Get current tenant ID from JWT
     */
    getTenantId(): string | null {
        return this.getTokenPayload()?.tenantId || null;
    }

    /**
     * Refresh access token using refresh token
     */
    private async refreshAccessToken(): Promise<boolean> {
        if (!this.refreshToken) return false;

        try {
            const response = await fetch(`${this.baseUrl}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken: this.refreshToken }),
            });

            if (!response.ok) {
                this.clearTokens();
                return false;
            }

            const data = await response.json();
            this.setTokens(data.accessToken, data.refreshToken);
            return true;
        } catch {
            this.clearTokens();
            return false;
        }
    }

    /**
     * Core fetch wrapper with auth and error handling
     */
    async request<T = any>(
        endpoint: string,
        options: RequestOptions = {},
    ): Promise<ApiResponse<T>> {
        const { skipAuth, ...fetchOptions } = options;

        // Auto-refresh token if expired
        if (!skipAuth && this.accessToken && this.isTokenExpired()) {
            const refreshed = await this.refreshAccessToken();
            if (!refreshed) {
                window.dispatchEvent(new CustomEvent('auth:expired'));
                throw new Error('Session expired');
            }
        }

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(fetchOptions.headers as Record<string, string>),
        };

        if (!skipAuth && this.accessToken) {
            headers['Authorization'] = `Bearer ${this.accessToken}`;
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...fetchOptions,
            headers,
        });

        // Handle 401 - try refresh once
        if (response.status === 401 && !skipAuth) {
            const refreshed = await this.refreshAccessToken();
            if (refreshed) {
                headers['Authorization'] = `Bearer ${this.accessToken}`;
                const retryResponse = await fetch(`${this.baseUrl}${endpoint}`, {
                    ...fetchOptions,
                    headers,
                });
                const data = await retryResponse.json().catch(() => null);
                return { data, status: retryResponse.status, ok: retryResponse.ok };
            }
            window.dispatchEvent(new CustomEvent('auth:expired'));
            throw new Error('Unauthorized');
        }

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            throw new Error(data?.message || `API error: ${response.status}`);
        }

        return { data, status: response.status, ok: response.ok };
    }

    // ==========================================
    // AUTH ENDPOINTS
    // ==========================================

    async login(email: string, password: string) {
        const res = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
            skipAuth: true,
        });
        this.setTokens(res.data.tokens.accessToken, res.data.tokens.refreshToken);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        return res.data;
    }

    async register(data: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        tenantName?: string;
    }) {
        const res = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
            skipAuth: true,
        });
        this.setTokens(res.data.tokens.accessToken, res.data.tokens.refreshToken);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        return res.data;
    }

    loginWithGoogle() {
        window.location.href = `${this.baseUrl}/auth/google`;
    }

    async logout() {
        this.clearTokens();
        window.dispatchEvent(new CustomEvent('auth:logout'));
    }

    // ==========================================
    // TENANT ENDPOINTS
    // ==========================================

    async getCurrentTenant() {
        return (await this.request('/tenants/current')).data;
    }

    async updateTenant(id: string, data: any) {
        return (await this.request(`/tenants/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        })).data;
    }

    async upgradePlan(id: string, plan: string) {
        return (await this.request(`/tenants/${id}/upgrade`, {
            method: 'PATCH',
            body: JSON.stringify({ plan }),
        })).data;
    }

    // ==========================================
    // CONNECTORS ENDPOINTS
    // ==========================================

    async getConnectors() {
        return (await this.request('/connectors')).data;
    }

    async syncConnector(connectorId: string) {
        return (await this.request(`/connectors/${connectorId}/sync`, {
            method: 'POST',
        })).data;
    }

    async syncAllConnectors() {
        return (await this.request('/connectors/sync-all', {
            method: 'POST',
        })).data;
    }

    async revokeConnector(connectorId: string) {
        return (await this.request(`/connectors/${connectorId}/revoke`, {
            method: 'POST',
        })).data;
    }

    // ==========================================
    // ANALYTICS ENDPOINTS
    // ==========================================

    async getOverview(startDate: string, endDate: string) {
        return (await this.request(
            `/analytics/overview?startDate=${startDate}&endDate=${endDate}`,
        )).data;
    }

    async getFunnel(startDate: string, endDate: string) {
        return (await this.request(
            `/analytics/funnel?startDate=${startDate}&endDate=${endDate}`,
        )).data;
    }

    async getTrafficSources(startDate: string, endDate: string) {
        return (await this.request(
            `/analytics/traffic-sources?startDate=${startDate}&endDate=${endDate}`,
        )).data;
    }

    async getGeographic(startDate: string, endDate: string) {
        return (await this.request(
            `/analytics/geographic?startDate=${startDate}&endDate=${endDate}`,
        )).data;
    }

    async getDeviceData(startDate: string, endDate: string) {
        return (await this.request(
            `/analytics/devices?startDate=${startDate}&endDate=${endDate}`,
        )).data;
    }

    async getCampaignPerformance(startDate: string, endDate: string) {
        return (await this.request(
            `/analytics/campaigns?startDate=${startDate}&endDate=${endDate}`,
        )).data;
    }

    // ==========================================
    // KPI ENDPOINTS
    // ==========================================

    async getKpiDefinitions() {
        return (await this.request('/kpi/definitions')).data;
    }

    async getKpiValues(startDate: string, endDate: string, granularity = 'day') {
        return (await this.request(
            `/kpi/values?startDate=${startDate}&endDate=${endDate}&granularity=${granularity}`,
        )).data;
    }

    async getTimeSeries(kpiCode: string, startDate: string, endDate: string) {
        return (await this.request(
            `/kpi/time-series?kpiCode=${kpiCode}&startDate=${startDate}&endDate=${endDate}`,
        )).data;
    }

    async getOverviewKPIs(startDate: string, endDate: string) {
        return (await this.request(
            `/kpi/overview?startDate=${startDate}&endDate=${endDate}`,
        )).data;
    }

    // ==========================================
    // ETL ENDPOINTS
    // ==========================================

    async triggerEtlSync(connectorId: string) {
        return (await this.request('/etl/sync', {
            method: 'POST',
            body: JSON.stringify({ connectorId }),
        })).data;
    }

    async reprocessEtlData(connectorId: string, startDate: string, endDate: string) {
        return (await this.request('/etl/reprocess', {
            method: 'POST',
            body: JSON.stringify({ connectorId, startDate, endDate }),
        })).data;
    }

    // ==========================================
    // EXPORT ENDPOINTS
    // ==========================================

    async exportCSV(data: any) {
        return (await this.request('/exports/csv', {
            method: 'POST',
            body: JSON.stringify(data),
        })).data;
    }

    async exportPDF(data: any) {
        return (await this.request('/exports/pdf', {
            method: 'POST',
            body: JSON.stringify(data),
        })).data;
    }

    // ==========================================
    // USER ENDPOINTS
    // ==========================================

    async getProfile() {
        return (await this.request('/users/me')).data;
    }

    async updateProfile(data: any) {
        return (await this.request('/users/me', {
            method: 'PATCH',
            body: JSON.stringify(data),
        })).data;
    }

    async listUsers(page = 1, limit = 10) {
        return (await this.request(`/users?page=${page}&limit=${limit}`)).data;
    }

    async getUser(id: string) {
        return (await this.request(`/users/${id}`)).data;
    }

    async updateUserRole(id: string, role: string) {
        return (await this.request(`/users/${id}/role`, {
            method: 'PUT',
            body: JSON.stringify({ role }),
        })).data;
    }

    async updateUserStatus(id: string, status: string) {
        return (await this.request(`/users/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        })).data;
    }

    async deleteUser(id: string) {
        return (await this.request(`/users/${id}`, {
            method: 'DELETE',
        })).data;
    }
}

// Singleton instance
export const api = new ApiClient(API_BASE_URL);
export default api;
