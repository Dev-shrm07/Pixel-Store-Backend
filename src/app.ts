
import https from 'https';
import env from "./utils/validateENV";
import app from "./app_1";
import mongoose from "mongoose";
import "dotenv/config";

const port = process.env.PORT || 8000;

mongoose.connect(env.MONGO_CONNECTION_STRING)
    .then(() => {
        console.log("Mongoose connected");
        app.listen(port, () => {
            console.log("Server running on port: " + port);
        });
    })
    .catch(console.error);
