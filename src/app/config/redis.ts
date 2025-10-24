import { createClient } from "redis";





const client = createClient({
    username: 'default',
    password: 'xGUt441p3aymCq0Pbk6oGI9P01AfDzXL',
    socket: {
        host: 'redis-12569.c10.us-east-1-2.ec2.redns.redis-cloud.com',
        port: 12569
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





