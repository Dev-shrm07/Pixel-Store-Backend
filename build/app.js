"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const validateENV_1 = __importDefault(require("./utils/validateENV"));
const app_1_1 = __importDefault(require("./app_1"));
const mongoose_1 = __importDefault(require("mongoose"));
require("dotenv/config");
const port = process.env.port || 8000;
mongoose_1.default.connect(validateENV_1.default.MONGO_CONNECTION_STRING).then(() => {
    console.log("db connected");
    app_1_1.default.listen(port, () => {
        console.log("app is running fine");
    });
});
