import express,{ Router} from "express";
import { signup,signin,refresh, getMe } from "../controllers/authController";
import { authenticate } from "../middleware/authMiddleware";
const router = Router();

router.post("/signup", signup);
router.post("/login", signin);
router.post("/refresh", refresh);
router.get("/me", authenticate ,getMe);

export default router;