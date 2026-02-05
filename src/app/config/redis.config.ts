import { createClient } from "redis";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const client = createClient({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT as string) : undefined,
    }
});

client.on('error', (err: Error) => {
    console.error('Redis error:', err);
});

client.on('connect', () => {
    console.log('Connected to Redis');
});

// Make sure to connect the client (important!)
// Connect inside an async function
async function connectRedis() {
    if (!client.isOpen) {
        await client.connect();
    }
}

connectRedis().catch(console.error);

export const redisClient = client;





