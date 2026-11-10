import { Request,Response } from "express";
import { signAccessToken,signRefreshToken,TokenPayload,verifyRefreshToken } from "../utils/jwt";
import User from "../models/User";
import { sign } from "jsonwebtoken";


export const signup = async (req: Request, res:Response):Promise<void> => {
    const { email, name, password,role} = req.body; 

    try{
        if(!email || !name || !password){
        res.status(400).json({
            message: "email, name, password must be provided" 
        })
        return;
    }

    const existing = await User.findOne({ email : email});
    if(existing) {
        res.status(409).json({ error: 'Email already registered' });
        return;
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
  }catch(err){
    console.error(err);
    res.status(500).json({
        message: "unable to signup",
        error: String(err)
    })
  }
}

export const signin = async (req: Request, res: Response): Promise<void> => {
   const { email,password } = req.body;
   try{
     if(!email || !password){
        res.status(411).json({
            message: "email and password must be provided"
        })
        return;
     }

     const user = await User.findOne({email: email});
     if(!user || !await (user.comparePassword(password))){
        res.status(404).json({
            message: 'Invalid email or pasword'
        })
        return;
    }

    const payload: TokenPayload = {userId: String(user._id), role: user.role, email: user.email};

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    res.status(200).json({
        message: "Signedin Succesfully",
        accessToken,
        refreshToken
    })
   }catch(err){
    console.error(err);
    res.status(500).json({
        message: "Error while signingin,please try again",
        errors: String(err)
    })
   }
}

export const refresh = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    if(!refreshToken){
        res.status(404).json({
            message: "Unauthorised! access token not found"
        })
        return;
    }

    const payload = verifyRefreshToken(refreshToken);
    if(!payload){
        res.status(404).json({
            message: "Invalid refresh token"
        })
        return;
    }
    const user =  await User.findById(payload.userId);
    if(!user){
        res.json({message: 'User not found'});
        return;
    }

   const newPayload: TokenPayload = { userId: String(user._id), role: user.role, email: user.email };
}

export async function getMe(req: Request, res: Response): Promise<void> {
  try {
    const user = await User.findById(req.user?.userId).select('-password');
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}