import express,{ Router} from "express";
import { signup,signin,refresh, getMe } from "../controllers/authController";
const router = Router();

router.post("/signup", signup);
router.post("/login", signin);
router.post("/refresh", refresh);
router.get("/me", getMe)

export default router;