import Quiz,{ IQuiz } from "../../models/Quiz";
import { redis,KEYS,CACHE_TTL } from "./redis";

export async function getCachedQuiz(quizId: string): Promise<IQuiz | null> {
    const key = KEYS.quiz(quizId);
    const cached = await redis.get(key);
    if(cached) return JSON.parse(cached) as IQuiz;

    const quiz = await Quiz.findById(quizId);
    await redis.set(key,JSON.stringify(quiz),'EX',CACHE_TTL);
    return quiz as unknown as IQuiz;
}