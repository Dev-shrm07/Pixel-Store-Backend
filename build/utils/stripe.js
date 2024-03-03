"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const validateENV_1 = __importDefault(require("./validateENV"));
const stripe_1 = __importDefault(require("stripe"));
const stripe = new stripe_1.default(validateENV_1.default.STRIPE_SECRET_TEST_KEY);
exports.default = stripe;
