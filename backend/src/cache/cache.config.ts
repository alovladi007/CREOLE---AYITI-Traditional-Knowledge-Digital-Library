import { CacheModuleOptions } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';

export const cacheConfig: CacheModuleOptions = {
  store: redisStore,
  host: process.env.REDIS_HOST || 'redis',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  ttl: 600, // 10 minutes default
  max: 1000, // Maximum number of items in cache
};

export const CACHE_KEYS = {
  RECORD: (id: string) => `record:${id}`,
  RECORDS_LIST: (params: string) => `records:list:${params}`,
  FACETS: 'records:facets',
  ANALYTICS_DASHBOARD: (params: string) => `analytics:dashboard:${params}`,
  USER_PROFILE: (userId: string) => `user:profile:${userId}`,
  SEARCH_RESULTS: (query: string, params: string) => `search:${query}:${params}`,
};

export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
};
