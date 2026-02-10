import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator to extract tenant ID from request
 * Usage: @GetTenantId() tenantId: string
 */
export const GetTenantId = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): string => {
        const request = ctx.switchToHttp().getRequest();
        return request.tenantId;
    },
);

/**
 * Decorator to extract full tenant object from request
 * Usage: @GetTenant() tenant: Tenant
 */
export const GetTenant = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.tenant;
    },
);
