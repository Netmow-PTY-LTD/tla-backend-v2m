/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "redis";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

// Redis Configuration and Client Singleton

let redisInternalClient: any;

const createInternalClient = () => {
    const redisOptions: any = {
        socket: {
            host: process.env.REDIS_HOST || '127.0.0.1',
            port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT as string) : 6379,
            reconnectStrategy: (retries: number) => {
                return Math.min(retries * 50, 500);
            }
        }
    };

    if (process.env.REDIS_PASSWORD) {
        redisOptions.password = process.env.REDIS_PASSWORD;
    }

    if (process.env.REDIS_USERNAME && process.env.REDIS_USERNAME !== 'default') {
        redisOptions.username = process.env.REDIS_USERNAME;
    }

    const newClient = createClient(redisOptions);

    newClient.on('error', (err: Error) => {
        console.error('Redis error:', err);
    });

    newClient.on('connect', () => {
        console.log('Connected to Redis');
    });

    return newClient;
};

// Initial creation
redisInternalClient = createInternalClient();

/**
 * Re-initializes the Redis client with latest process.env values.
 */
export const reinitRedis = async () => {
    console.log('🔄 Re-initializing Redis client with updated configurations...');
    try {
        if (redisInternalClient && redisInternalClient.isOpen) {
            await redisInternalClient.disconnect();
        }
    } catch (err: any) {
        console.warn('⚠️ Error during Redis disconnect:', err?.message || err);
    }
    redisInternalClient = createInternalClient();
    await redisInternalClient.connect();
};

// Proxy to allow seamless swapping of the client instance
export const redisClient = new Proxy({} as any, {
    get: (target, prop: string | symbol) => {
        if (!redisInternalClient) return undefined;
        const value = (redisInternalClient as any)[prop];
        if (typeof value === 'function') {
            return value.bind(redisInternalClient);
        }
        return value;
    }
});

async function connectRedis() {
    try {
        if (!redisInternalClient.isOpen) {
            await redisInternalClient.connect();
        }
    } catch (err: any) {
        console.error('❌ Redis initial connection failed:', err.message);
    }
}

connectRedis().catch(console.error);








// import { createClient } from "redis";
// import dotenv from "dotenv";
// import path from "path";

// dotenv.config({ path: path.join(process.cwd(), ".env") });

// const client = createClient({
//     username: process.env.REDIS_USERNAME,
//     password: process.env.REDIS_PASSWORD,
//     socket: {
//         host: process.env.REDIS_HOST,
//         port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT as string) : undefined,
//     }
// });

// client.on('error', (err: Error) => {
//     console.error('Redis error:', err);
// });

// client.on('connect', () => {
//     console.log('Connected to Redis');
// });

// // Make sure to connect the client (important!)
// // Connect inside an async function
// async function connectRedis() {
//     if (!client.isOpen) {
//         await client.connect();
//     }
// }

// connectRedis().catch(console.error);

// export const redisClient = client;


