import { ConnectionOptions } from 'bullmq';
import config from './index';

export const redisConnection: ConnectionOptions = {
    host: config.redis_host || '127.0.0.1',
    port: config.redis_port ? parseInt(config.redis_port as string) : 6379,
    password: config.redis_password,
    username: config.redis_username,
};

export const DEFAULT_REMOVE_DELAY = 1000 * 60 * 60 * 24; // 24 hours
export const DEFAULT_REMOVE_COUNT = 1000;
