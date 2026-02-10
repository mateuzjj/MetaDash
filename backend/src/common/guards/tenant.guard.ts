import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * Guard to ensure request has valid tenant context
 * Use @UseGuards(TenantGuard) on routes that require tenant
 */
@Injectable()
export class TenantGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();

        // Check if tenant ID exists in request (set by TenantMiddleware)
        if (!request.tenantId) {
            throw new UnauthorizedException('Tenant context required');
        }

        // Check if tenant is active
        if (!request.tenant?.isActive && !request.tenant?.isTrial) {
            throw new UnauthorizedException('Tenant is not active');
        }

        return true;
    }
}
