import { ThrottlerModuleOptions } from '@nestjs/throttler';

export const rateLimitConfig: ThrottlerModuleOptions = {
  throttlers: [
    {
      name: 'short',
      ttl: 1000, // 1 second
      limit: 10, // 10 requests per second
    },
    {
      name: 'medium',
      ttl: 60000, // 1 minute
      limit: 100, // 100 requests per minute
    },
    {
      name: 'long',
      ttl: 3600000, // 1 hour
      limit: 1000, // 1000 requests per hour
    }
  ]
};

// Custom decorators for specific endpoints
export const PUBLIC_RATE_LIMIT = {
  ttl: 60000,
  limit: 20
};

export const SEARCH_RATE_LIMIT = {
  ttl: 60000,
  limit: 60
};

export const UPLOAD_RATE_LIMIT = {
  ttl: 60000,
  limit: 10
};

export const EXPORT_RATE_LIMIT = {
  ttl: 3600000,
  limit: 5
};
