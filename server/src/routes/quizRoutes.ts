import { Router } from "express";
import { requireRole } from "../middleware/authMiddleware";
import { createQuiz } from "../controllers/quizController";

const router = Router();

router.post("/", requireRole('admin','organizer'), createQuiz);

export default router;
