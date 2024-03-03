"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validateENV_1 = __importDefault(require("./utils/validateENV"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = require("./middlewares/auth");
const morgan_1 = __importDefault(require("morgan"));
const http_errors_1 = __importStar(require("http-errors"));
const post_1 = __importDefault(require("./routes/post"));
const payments_1 = __importDefault(require("./routes/payments"));
const welcome_1 = __importDefault(require("./routes/welcome"));
const user_1 = __importDefault(require("./routes/user"));
const body_parser_1 = __importDefault(require("body-parser"));
const express_session_1 = __importDefault(require("express-session"));
require("dotenv/config");
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const app = (0, express_1.default)();
app.set("trust proxy", 1);
app.use((0, express_session_1.default)({
    secret: validateENV_1.default.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60 * 60 * 1000,
        secure: true,
        httpOnly: false,
        sameSite: "none",
    },
    rolling: true,
    store: connect_mongo_1.default.create({
        mongoUrl: validateENV_1.default.MONGO_CONNECTION_STRING,
    }),
}));
app.use((0, cors_1.default)({
    origin: "https://pixelstoreindx.netlify.app/",
    credentials: true,
}));
app.use((0, morgan_1.default)("dev"));
app.use("/api/payments", payments_1.default);
app.use(body_parser_1.default.json({ limit: "500mb" }));
app.use(body_parser_1.default.urlencoded({
    extended: true,
    limit: "35mb",
    parameterLimit: 50000,
}));
app.use(express_1.default.json());
app.use("/api/user", user_1.default);
app.use("/api/posts", auth_1.requireUserAuth, post_1.default);
app.use("/welcome", welcome_1.default);
app.use((req, res, next) => {
    next((0, http_errors_1.default)(404, "Error not found"));
});
app.use((error, req, res, next) => {
    //console.error(error);
    let errorMessage = "An unknown error occurred";
    let statusCode = 500;
    if ((0, http_errors_1.isHttpError)(error)) {
        errorMessage = error.message;
        statusCode = error.status;
    }
    res.status(statusCode).json({ error: errorMessage });
});
exports.default = app;
