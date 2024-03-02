import { RequestHandler } from "express";
import UserModel from "../models/user";
import createHttpError from "http-errors";
import phash from "password-hash";
import mongoose from "mongoose";

interface SignUpBody {
  email: string;
  password: string;
  username: string;
}
export const getauthUser: RequestHandler = async (req, res, next) => {
  try {

    const user = await UserModel.findOne({_id:req.session.userID},'username reg_seller').exec()
    if(!user){
        next(createHttpError(404, "user not found"))
        return
    }
    const userr:UserResponse={
      username:user?.username,
      reg_seller:user?.reg_seller
    }
    res.setHeader('Cache-Control', 'no-store, no-cache, private');
    res.status(200).json(userr);
  } catch (error) {
    next(error);
  }
};
export const Signup: RequestHandler<
  unknown,
  unknown,
  SignUpBody,
  unknown
> = async (req, res, next) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  try {
    if (!username || !email || !password) {
      throw createHttpError(400, "Parameters are missing");
    }
    const user_find = await UserModel.findOne({ email: email }).exec();
    if (user_find) {
      throw createHttpError(404, "email already registered");
    }
    const user_find_1 = await UserModel.findOne({ username: username }).exec();
    if (user_find_1) {
      throw createHttpError(404, "Username already taken");
    }
    const p = phash.generate(password);
    const new_user = await UserModel.create({
      email: email,
      password: p,
      username: username,
      reg_seller: false,
      savedPosts: [],
    });
    const Userresponse: UserResponse = {
      username: new_user.username,
      reg_seller: new_user.reg_seller,
    };
    req.session.userID = new_user._id;
    res.setHeader('Cache-Control', 'no-store, no-cache, private');

    res.status(200).json(Userresponse);
  } catch (error) {
    next(error);
  }
};

interface LoginBody {
  username?: string;
  email?: string;
  password: string;
}

interface UserResponse {
  username?: string;
  reg_seller?: boolean;
}

export const Login: RequestHandler<
  unknown,
  unknown,
  LoginBody,
  unknown
> = async (req, res, next) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  try {
    let user;
    if (!email && !username) {
      throw createHttpError(404, "Please give complete parameters");
    }
    if (!email) {
      user = await UserModel.findOne({ username: username }).exec();
    } else if (!username) {
      user = await UserModel.findOne({ email: email }).exec();
    }
    if (!user) {
      throw createHttpError(404, "No User found");
    }
    const p = user.password;
    if (!p) {
      throw createHttpError(401, "inavlid details");
    }
    const matched = phash.verify(password, p);
    if (!matched) {
      throw createHttpError(404, "wrong password");
    }
    const UserResponse: UserResponse = {
      username: user.username,
      reg_seller: user.reg_seller,
    };
    req.session.userID = user._id;
    res.setHeader('Cache-Control', 'no-store, no-cache, private');

    res.status(200).json(UserResponse);
  } catch (error) {
    next(error);
  }
};

export const Logout: RequestHandler = async (req, res, next) => {
  req.session.destroy((error) => {
    if (error) {
      next(error);
    } else {
      res.sendStatus(200);
    }
  });
};

interface UserModelReturn{
  username?:string,
  reg_seller?:boolean
}
export const setRegSeller: RequestHandler = async(req,res,next)=>{
  try {
    const user = await UserModel.findOne({_id:req.session.userID}).exec()
    if(!user){
      next(createHttpError(404, "No user found"))
      return
    }
    user.reg_seller = true
    await user.save()
    const response:UserModelReturn={
      username : user.username,
      reg_seller: user.reg_seller
    }
    res.setHeader('Cache-Control', 'no-store, no-cache, private');
    res.status(201).json(response)
    return
  } catch (error) {
    next(error)
  }
}

interface changeUsername{
  username:string
}
export const EditUser: RequestHandler<
  unknown,
  unknown,
  changeUsername,
  unknown
> = async (req, res, next) => {
  const username = req.body.username;
  if(!username){
    throw createHttpError(404, "no username")
  }
  try {
    const user = await UserModel.findOne({_id:req.session.userID}).exec()
    if(!user){
      throw createHttpError(401, "user not found")
    }
    user.username = username
    const UserResponse: UserResponse = {
      username: username,
      reg_seller: user.reg_seller,
    };
    await user.save()
    req.session.userID = user._id;
    res.setHeader('Cache-Control', 'no-store, no-cache, private');

    res.status(200).json(UserResponse);
  } catch (error) {
    next(error);
  }
};