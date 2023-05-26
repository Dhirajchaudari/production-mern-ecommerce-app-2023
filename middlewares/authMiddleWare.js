import JWT from 'jsonwebtoken'
import userModel from '../models/userModel.js';

// Protected Routes token base

export const requireSignIn = async ( req, resp, next ) => {  // if decode verified then it will go to next.
    try {
        const decode = JWT.verify(req.headers.authorization, process.env.JWT_SECRET);
        // after decode we have to pass it to user
        req.user = decode
        next()
    } catch (error) {
        console.log(error);
    }
}

// admin access middleware

export const isAdmin = async ( req, resp, next) =>{
    try {
        const user = await userModel.findById(req.user._id);
        if(user.role !== 1){
            return resp.status(401).send({
                success: false,
                message: "UnAuthorized access"
            })
        }else {
            next()
        }
    } catch (error) {
        console.log(error)
        resp.status(401).send({
            success:false,
            message: "Error in Admin MiddleWare",
            error
        })
    }
}