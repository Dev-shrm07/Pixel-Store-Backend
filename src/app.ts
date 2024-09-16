import fs from 'fs';
import https from 'https';
import env from "./utils/validateENV";
import app from "./app_1";
import mongoose from "mongoose";
import "dotenv/config";

const port = process.env.PORT || 8000;

// Load SSL certificates
const options = {
  key: fs.readFileSync('./certs/server.key'),
  cert: fs.readFileSync('./certs/server.crt'),
};

// Connect to MongoDB
mongoose.connect(env.MONGO_CONNECTION_STRING).then(() => {
    console.log("DB connected");
    
    // Create HTTPS server
    https.createServer(options, app).listen(port, () => {
        console.log(`App is running on https://localhost:${port}`);
    });
}).catch((error) => {
    console.error("Error connecting to DB:", error);
    process.exit(1);
});
