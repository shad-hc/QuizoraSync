import { Request,Response,NextFunction } from "express";
import jwt from "jsonwebtoken";
import { verifyAccessToken,TokenPayload } from "../utils/jwt";
import { UserRole } from "../models/User";

export const authenticate = (req: Request,res: Response,
next: NextFunction) => {
    const authheader = req.headers["authorization"];
    if(!authheader?.startsWith('Bearer ')){
        res.status(401).json({ message: "Invalid or missing token"})
        return;
    }

    // const decoded: TokenPayload = verifyAccessToken(token.split(' ')[1]);
    const token = authheader.split(' ')[1];
    if(!token){
        res.status(401).json({ message: "Invalid or missing token"})
        return;
    }

    try{
        const decoded: TokenPayload = verifyAccessToken(token);
    if(decoded){
        req.user = decoded;
        next();
    }
    }catch{
        res.status(401).json({ error: 'Invalid or expired token' });
    }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: `Requires one of roles: ${roles.join(', ')}` });
      return;
    }
    next();
  };
}