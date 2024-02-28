import env from "./utils/validateENV"
import app from "./app"
import mongoose from "mongoose"
import express from "express"
import "dotenv/config"
import Razorpay from "razorpay"

const port = process.env.port || 8000


mongoose.connect(env.MONGO_CONNECTION_STRING).then(()=>{
    console.log("db connected")
    app.listen(port, ()=>{
        console.log("app is running fine")
    })
})
