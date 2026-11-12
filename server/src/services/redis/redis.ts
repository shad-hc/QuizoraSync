import Redis  from "ioredis";

export const redis = new Redis({
    host: process.env.REDIS_HOST || "locahost",
    port: Number(process.env.REDIS_PORT) || 6379,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    enableOfflineQueue: false,
    enableReadyCheck: true,
    keepAlive: 30000
})

redis.on('connect' , () => {
    console.log(`[redis] connected`);
})

redis.on('error', (err) => console.error(`[Redis] publisher error`, err.message));

export const KEYS = {
    quiz: (id: string) => `quiz:${id}`
}

export const CACHE_TTL = 60 * 60;
