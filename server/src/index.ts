import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import authRoutes from "./routes/authRoutes";
const app = express();

app.use("api/v1/auth",authRoutes);

app.listen(3000);