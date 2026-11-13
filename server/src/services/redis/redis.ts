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

export interface RoomState {
    quizId: string;
    currentQuestionIndex: number;
    qStartedAt: number; // unix ms
    status: 'waiting' | 'active' | 'ended';
    hostId: string;
}

export const KEYS = {
    quiz: (id: string) => `quiz:${id}`,
    questions: (id: string) => `questions:${id}`,
    leaderboard: (id: string) => `leaderboard:room:${id}`,
    roomState: (id: string) => `room:state:${id}`,
    userScore: (quizId: string, userId: string) => `room:score:${quizId}:${userId}`,
    answered: (quizId: string, qIndex: number) => `room:answered:${quizId}:${qIndex}`,
}

export const CACHE_TTL = 60 * 60;

export async function setRoomState(quizId: string, state: RoomState)
:Promise<void> {
    await redis.set(KEYS.roomState(quizId), JSON.stringify(state), 'EX', CACHE_TTL);
}

export async function getRoomState(quizId: string): Promise<RoomState | null>{
    const raw = await redis.get(KEYS.roomState(quizId));
    return raw ? (JSON.parse(raw) as RoomState) : null;
}

export async function deleteRoomState(quizId: string): Promise<void> {
    await redis.del(KEYS.roomState(quizId));
}

export async function updateLeadeboard (quizId: string, userId: string,
score: number): Promise<void>{
    const pipeline = redis.pipeline();

    pipeline.zadd(KEYS.leaderboard(quizId), 'NX', 0, userId); // if user is not aldready on leaderboar,add it
    pipeline.zincrby(KEYS.leaderboard(quizId),score,userId);
    pipeline.expire(KEYS.leaderboard(quizId), CACHE_TTL * 6);

    await pipeline.exec();
}



