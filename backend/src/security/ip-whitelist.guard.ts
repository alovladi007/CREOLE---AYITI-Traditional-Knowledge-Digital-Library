import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class IpWhitelistGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const whitelistedIps = this.reflector.get<string[]>('ip-whitelist', context.getHandler());

    if (!whitelistedIps || whitelistedIps.length === 0) {
      return true; // No restriction
    }

    const request = context.switchToHttp().getRequest<Request>();
    const clientIp = this.getClientIp(request);

    if (!clientIp || !whitelistedIps.includes(clientIp)) {
      throw new ForbiddenException('Access denied: IP address not whitelisted');
    }

    return true;
  }

  private getClientIp(request: Request): string {
    return (
      (request.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      (request.headers['x-real-ip'] as string) ||
      request.socket.remoteAddress ||
      ''
    );
  }
}

// Decorator to set IP whitelist
export const IpWhitelist = (...ips: string[]) => {
  return (target: any, key?: string, descriptor?: PropertyDescriptor) => {
    if (descriptor) {
      Reflect.defineMetadata('ip-whitelist', ips, descriptor.value);
      return descriptor;
    }
    Reflect.defineMetadata('ip-whitelist', ips, target);
    return target;
  };
};
