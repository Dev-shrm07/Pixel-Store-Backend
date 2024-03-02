import { RequestHandler } from "express";
import createHttpError from "http-errors";



export const requireUserAuth:RequestHandler=async(req,res,next)=>{
    if(req.session.userID){
        next()
    }else{
        next(createHttpError(404, "no valid user"))
    }
}