import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';

/**
 * Hook to fetch data from the API with loading/error states
 * Automatically reloads when dependencies change
 */
export function useApiData<T>(
    fetcher: () => Promise<T>,
    deps: any[] = [],
) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const mountedRef = useRef(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetcher();
            if (mountedRef.current) {
                setData(result);
            }
        } catch (err: any) {
            if (mountedRef.current) {
                setError(err.message || 'Failed to fetch data');
            }
        } finally {
            if (mountedRef.current) {
                setLoading(false);
            }
        }
    }, deps);

    useEffect(() => {
        mountedRef.current = true;
        fetchData();
        return () => { mountedRef.current = false; };
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to get date range for analytics
 */
export function useDateRange(defaultDays = 30) {
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        date.setDate(date.getDate() - defaultDays);
        return date.toISOString().split('T')[0];
    });

    const [endDate, setEndDate] = useState(() => {
        return new Date().toISOString().split('T')[0];
    });

    const setRange = useCallback((days: number) => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - days);
        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(end.toISOString().split('T')[0]);
    }, []);

    return { startDate, endDate, setStartDate, setEndDate, setRange };
}

/**
 * Hook to get overview KPIs
 */
export function useOverview(startDate: string, endDate: string) {
    return useApiData(
        () => api.getOverview(startDate, endDate),
        [startDate, endDate],
    );
}

/**
 * Hook to get connectors
 */
export function useConnectors() {
    return useApiData(() => api.getConnectors());
}

/**
 * Hook to get KPI values
 */
export function useKpiValues(startDate: string, endDate: string, granularity = 'day') {
    return useApiData(
        () => api.getKpiValues(startDate, endDate, granularity),
        [startDate, endDate, granularity],
    );
}

/**
 * Hook to get time series data
 */
export function useTimeSeries(kpiCode: string, startDate: string, endDate: string) {
    return useApiData(
        () => api.getTimeSeries(kpiCode, startDate, endDate),
        [kpiCode, startDate, endDate],
    );
}

/**
 * Hook to get campaign performance data
 */
export function useCampaigns(startDate: string, endDate: string) {
    return useApiData(
        () => api.getCampaignPerformance(startDate, endDate),
        [startDate, endDate],
    );
}

/**
 * Hook to get funnel data
 */
export function useFunnel(startDate: string, endDate: string) {
    return useApiData(
        () => api.getFunnel(startDate, endDate),
        [startDate, endDate],
    );
}

/**
 * Hook to get traffic sources
 */
export function useTrafficSources(startDate: string, endDate: string) {
    return useApiData(
        () => api.getTrafficSources(startDate, endDate),
        [startDate, endDate],
    );
}

/**
 * Hook to get geographic data
 */
export function useGeographicData(startDate: string, endDate: string) {
    return useApiData(
        () => api.getGeographic(startDate, endDate),
        [startDate, endDate],
    );
}
