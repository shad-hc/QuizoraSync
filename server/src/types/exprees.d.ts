import { Request } from "express";
import { TokenPayload } from "../utils/jwt";

export declare global {
    namespace Express {
        interface Request{
            user?: TokenPayload
        }
    }
}