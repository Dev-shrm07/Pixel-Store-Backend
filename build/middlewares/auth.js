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
exports.requireUserAuth = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const requireUserAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.session.userID) {
        next();
    }
    else {
        console.log("here");
        next((0, http_errors_1.default)(404, "no valid user"));
    }
});
exports.requireUserAuth = requireUserAuth;
