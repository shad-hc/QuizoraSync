import { Request,Response } from "express";
import { signAccessToken,signRefreshToken,TokenPayload } from "../utils/jwt";
import User from "../models/User";


export const signup = async (req: Request, res:Response):Promise<void> => {
    const { email, name, password,role} = req.body; 

    if(!email || !name || !password){
        res.status(400).json({
            message: "email, name, password must be provided" 
        })
    }

    const existing = await User.findOne({ email : email});
    if(existing) {
        res.status(409).json({ error: 'Email already registered' });
    }

    const safeRole = ['user', 'organizer','admin'].includes(role) ? role : 'user';

    const user = await User.create({email,name,password,role: safeRole});
    const payload: TokenPayload = { userId: String(user._id), role: user.role, email: user.email };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    res.status(201).json({
        message: "signedup succesfully",
        accessToken,
        refreshToken
    })
}

export const signin = () => {

}