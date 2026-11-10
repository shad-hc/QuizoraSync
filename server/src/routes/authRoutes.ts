import express,{ Router} from "express";
import { signup,signin } from "../controllers/authController";
const router = Router();

router.post("/signup", signup);
router.post("login", signin);
// router.post("/refresh", refresh);

export default router;