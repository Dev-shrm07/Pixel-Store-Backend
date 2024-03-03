"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditUser = exports.setRegSeller = exports.Logout = exports.Login = exports.Signup = exports.getauthUser = void 0;
const user_1 = __importDefault(require("../models/user"));
const http_errors_1 = __importDefault(require("http-errors"));
const password_hash_1 = __importDefault(require("password-hash"));
const getauthUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_1.default.findOne({ _id: req.session.userID }, 'username reg_seller').exec();
        if (!user) {
            next((0, http_errors_1.default)(404, "user not found"));
            return;
        }
        const userr = {
            username: user === null || user === void 0 ? void 0 : user.username,
            reg_seller: user === null || user === void 0 ? void 0 : user.reg_seller
        };
        res.setHeader('Cache-Control', 'no-store, no-cache, private');
        res.status(200).json(userr);
    }
    catch (error) {
        next(error);
    }
});
exports.getauthUser = getauthUser;
const Signup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    try {
        if (!username || !email || !password) {
            throw (0, http_errors_1.default)(400, "Parameters are missing");
        }
        const user_find = yield user_1.default.findOne({ email: email }).exec();
        if (user_find) {
            throw (0, http_errors_1.default)(404, "email already registered");
        }
        const user_find_1 = yield user_1.default.findOne({ username: username }).exec();
        if (user_find_1) {
            throw (0, http_errors_1.default)(404, "Username already taken");
        }
        const p = password_hash_1.default.generate(password);
        const new_user = yield user_1.default.create({
            email: email,
            password: p,
            username: username,
            reg_seller: false,
            savedPosts: [],
        });
        const Userresponse = {
            username: new_user.username,
            reg_seller: new_user.reg_seller,
        };
        req.session.userID = new_user._id;
        res.setHeader('Cache-Control', 'no-store, no-cache, private');
        res.status(200).json(Userresponse);
    }
    catch (error) {
        next(error);
    }
});
exports.Signup = Signup;
const Login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    try {
        let user;
        if (!email && !username) {
            throw (0, http_errors_1.default)(404, "Please give complete parameters");
        }
        if (!email) {
            user = yield user_1.default.findOne({ username: username }).exec();
        }
        else if (!username) {
            user = yield user_1.default.findOne({ email: email }).exec();
        }
        if (!user) {
            throw (0, http_errors_1.default)(404, "No User found");
        }
        const p = user.password;
        if (!p) {
            throw (0, http_errors_1.default)(401, "inavlid details");
        }
        const matched = password_hash_1.default.verify(password, p);
        if (!matched) {
            throw (0, http_errors_1.default)(404, "wrong password");
        }
        const UserResponse = {
            username: user.username,
            reg_seller: user.reg_seller,
        };
        req.session.userID = user._id;
        res.setHeader('Cache-Control', 'no-store, no-cache, private');
        res.status(200).json(UserResponse);
    }
    catch (error) {
        next(error);
    }
});
exports.Login = Login;
const Logout = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    req.session.destroy((error) => {
        if (error) {
            next(error);
        }
        else {
            res.sendStatus(200);
        }
    });
});
exports.Logout = Logout;
const setRegSeller = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_1.default.findOne({ _id: req.session.userID }).exec();
        if (!user) {
            next((0, http_errors_1.default)(404, "No user found"));
            return;
        }
        user.reg_seller = true;
        yield user.save();
        const response = {
            username: user.username,
            reg_seller: user.reg_seller
        };
        res.setHeader('Cache-Control', 'no-store, no-cache, private');
        res.status(201).json(response);
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.setRegSeller = setRegSeller;
const EditUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.body.username;
    if (!username) {
        throw (0, http_errors_1.default)(404, "no username");
    }
    try {
        const user = yield user_1.default.findOne({ _id: req.session.userID }).exec();
        if (!user) {
            throw (0, http_errors_1.default)(401, "user not found");
        }
        user.username = username;
        const UserResponse = {
            username: username,
            reg_seller: user.reg_seller,
        };
        yield user.save();
        req.session.userID = user._id;
        res.setHeader('Cache-Control', 'no-store, no-cache, private');
        res.status(200).json(UserResponse);
    }
    catch (error) {
        next(error);
    }
});
exports.EditUser = EditUser;
