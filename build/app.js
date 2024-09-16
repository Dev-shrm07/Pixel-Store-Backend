"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const https_1 = __importDefault(require("https"));
const validateENV_1 = __importDefault(require("./utils/validateENV"));
const app_1_1 = __importDefault(require("./app_1"));
const mongoose_1 = __importDefault(require("mongoose"));
require("dotenv/config");
const port = process.env.PORT || 8000;
// Load SSL certificates
const options = {
    key: fs_1.default.readFileSync('./certs/server.key'),
    cert: fs_1.default.readFileSync('./certs/server.crt'),
};
// Connect to MongoDB
mongoose_1.default.connect(validateENV_1.default.MONGO_CONNECTION_STRING).then(() => {
    console.log("DB connected");
    // Create HTTPS server
    https_1.default.createServer(options, app_1_1.default).listen(port, () => {
        console.log(`App is running on https://localhost:${port}`);
    });
}).catch((error) => {
    console.error("Error connecting to DB:", error);
    process.exit(1);
});
