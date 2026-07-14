import { createClient } from 'redis';
import env from './env';

const redisClient = createClient({ url: env.REDIS_URL });

redisClient.on('error', (err) => console.error('Redis error:', err));
redisClient.on('connect', () => console.log('Redis connected'));

export const connectRedis = async (): Promise<void> => {
    await redisClient.connect();
};

export default redisClient;