import mongoose, { Document,Schema} from "mongoose";

export type QuizStatus = 'draft' | 'active' | 'ended';

export interface IQuiz extends Document {
    title: string,
    description: string;
    hostId: mongoose.Types.ObjectId,
    status: QuizStatus;
    currentQuestionIndex: number,
    startedAt: Date;
    endedAt: Date;
    participantCount: number;
}

const quizSchema = new Schema<IQuiz> ({
    title: {type: String, required: true, trim: true},
    description: {type: String, default: ''},
    hostId: {type: mongoose.Types.ObjectId, ref: 'User', required: true},
    status: {type: String, enum : ['draft', 'active', 'ended']},
    currentQuestionIndex: {type: Number, default: -1},
    startedAt: {type: Date},
    endedAt: {type: Date},
    participantCount: {type: Number, default: 0}
})

export default mongoose.model<IQuiz>('Quizzes', quizSchema);