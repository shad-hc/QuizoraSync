import mongoose, { Document,Schema } from "mongoose";

export interface IQuestion extends Document {
    quizId: mongoose.Types.ObjectId;
    text: string;
    options: string[];
    correctOptionIndex: number;
    points: number;
    timeLimitSeconds: number;
    order: number;
}

const questionSchema = new Schema<IQuestion>(
    {
    quizId: {type: mongoose.Types.ObjectId, ref: 'Quizzes', required: true},
    text: {type: String, required: true},
    options: {type: [String], required: true, validate: (v: string[]) => 
        v.length >= 4 && v.length <= 6
    },
    correctOptionIndex: {type: Number, required: true, min: 0},
    points: {type : Number, default: 10},
    timeLimitSeconds: {type: Number, default: 30, min: 10},
    order: {type: Number, default: 0 },
    },
    {timestamps : true}
)

export default mongoose.model<IQuestion>('Questions',questionSchema);