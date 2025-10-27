import { createClient } from "redis";
import config from ".";



const client = createClient({
    username: config.redis_username,
    password: config.redis_password,
    socket: {
        host: config.redis_host,
        port: config.redis_port ? parseInt(config.redis_port) : undefined,
    }
});

client.on('error', (err) => {
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





