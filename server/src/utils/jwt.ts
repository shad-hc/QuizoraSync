import jwt from "jsonwebtoken";
import { UserRole } from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

export interface TokenPayload {
    userId : string;
    role : UserRole;
    email : string;
}

export const signAccessToken = (payload: TokenPayload):string => {
    return jwt.sign(payload,JWT_SECRET,{expiresIn: '15m'});
}

export const signRefreshToken = (payload: TokenPayload):string => {
    return jwt.sign(payload,JWT_SECRET,{expiresIn: '7d'});
}

export const verifyAccessToken = (token : string):TokenPayload =>{
    return jwt.verify(token,JWT_SECRET) as TokenPayload;
} 

export const verifyRefreshToken = (token : string):TokenPayload =>{
    return jwt.verify(token,JWT_SECRET) as TokenPayload;
} 