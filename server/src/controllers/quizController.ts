import { Request,Response } from "express";
import Quiz from "../models/Quiz";
import Question from "../models/Question";

export const createQuiz = async (req: Request, res: Response): Promise<void> => {
//     const { title,description,questions } = req.body;
//    try{
//     if(!title || !Array.isArray(questions) || questions.length === 0){
//         res.status(400).json({ message: "Invalid Request: title and questions must be provided"});
//         return;
//     }
//     if(!req.user){
//         res.status(401).json({ message: "Unauthorized" });
//         return;
//     }

//     const quiz = await Quiz.create({
//         title, description, hostId: req.user.userId
//     })

//     try{
//         const questionDocs = await Question.insertMany(
//             questions.map((q: any, i: number) => ({
//                 quizId: quiz._id,
//                 text: q.text,
//                 options: q.options,
//                 correctOptionIndex: q.correctOptionIndex,
//                 points: q.points ?? 10,
//                 timeLimitSeconds: q.timeLimitSeconds ?? 30,
//                 order: i,
//             }))
//         )

//         res.status(201).json({ quiz, questions: questionDocs });
//     }catch(err){
//         // Don't leave a quiz with no questions behind if a question fails validation
//         await Quiz.deleteOne({ _id: quiz._id });
//         throw err;
//     }
//    }catch(err){
//     console.error(String(err));
//     res.status(500).json({ message: "Invalid request or server issue"})
//    }
}
