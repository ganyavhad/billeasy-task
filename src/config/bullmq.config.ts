import { QueueOptions } from 'bullmq';

export const redisConfig: QueueOptions = {
    connection: {
        host: process.env.REDIS_HOST,
        port: +(process.env.REDIS_PORT || '6379'),
    },
};