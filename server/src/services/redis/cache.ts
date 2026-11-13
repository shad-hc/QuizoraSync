import Quiz,{ IQuiz } from "../../models/Quiz";
import Question, { IQuestion } from "../../models/Question";
import { redis,KEYS,CACHE_TTL } from "./redis";

export async function getCachedQuiz(quizId: string): Promise<IQuiz | null> {
    const key = KEYS.quiz(quizId);
    const cached = await redis.get(key);
    if(cached) return JSON.parse(cached) as IQuiz;

    const quiz = await Quiz.findById(quizId);
    await redis.set(key,JSON.stringify(quiz),'EX',CACHE_TTL);
    return quiz as unknown as IQuiz;
}

export const getCachedQuestions = async (quizId: string)
: Promise<IQuestion[] | null> => {
    const cached = await redis.get(KEYS.questions(quizId));
    if(cached) return JSON.parse(cached) as IQuestion[];

    const questions = await Question.find({ quizId }).sort({order: 1}).lean();
    await redis.set(KEYS.questions(quizId), JSON.stringify(questions), 'EX', CACHE_TTL);

    return questions as unknown as IQuestion[];
}

export const invalidateQuizCache = async (quizId: string): Promise<void> => {
    await redis.del(KEYS.quiz(quizId));
    await redis.del(KEYS.questions(quizId));
}