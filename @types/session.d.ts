import mongoose from "mongoose";

declare module "express-session"{
    interface SessionData{
        userID: mongoose.Types.ObjectId
    }
}