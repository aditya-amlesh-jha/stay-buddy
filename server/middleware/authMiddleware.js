import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import User from '../models/userModel.js';
import { verify_token } from "../helper/tokenHelper.js";

async function verifyIdentity(req, res, next) {
    try {
        if (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer")){
            throw new Error("No token provided!")
        }

        const token = req.headers.authorization.split(" ")[1];
        const decoded_token = verify_token(token);
        const user_id = decoded_token;
        const user = await User.findById(user_id);

        req.user = user;

        next();
    }
    catch (error) {
        res.status(StatusCodes.UNAUTHORIZED).json({ message: "No token, no auth" });
    }
}

async function checkAdmin (req, res, next){
    try{
        if(!req.user){
            throw new Error("No user provided!")
        }

        if(!req.user.isAdmin){
            throw new Error("Not an admin");
        }

        next();
    }
    catch( error ){
        res.status(StatusCodes.UNAUTHORIZED).json({ message: "Not authorized as an admin" });
    }
}

export {
    verifyIdentity,
    checkAdmin
}