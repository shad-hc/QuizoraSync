import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import cors from "cors";
import http from "http";
import mongoose from 'mongoose';
import authRoutes from "./routes/authRoutes";
import quizRoutes from "./routes/quizRoutes";
const app = express();

const HTTP_PORT = process.env.HTTP_PORT || 4000;

app.use(cors({origin: '*', methods: ['GET', 'POST','PUT','DELETE','OPTIONS' ]}));

app.use(express.json({limit : '2mb'}));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/quiz", quizRoutes);

app.get("/health", (_req,res) => res.json({ status: "ok", timestamp: new Date()}));

const server = http.createServer(app);

async function start() {
    try{
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/quiz-web");
        console.log(`[DB] connected`);
        server.listen(HTTP_PORT, () => {
            console.log(`Server is listnening on ${HTTP_PORT}`);
        })
    }catch(err){
        console.error('[Startup] Fatal error:', err);
        process.exit(1);
    }
}

start();