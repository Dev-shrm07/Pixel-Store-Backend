"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const PaymentSchema = new mongoose_1.Schema({
    post: { type: mongoose_1.Schema.ObjectId, require: true },
    user: { type: mongoose_1.Schema.ObjectId, require: true },
    session_id: { type: String, require: true },
    completed: { type: Boolean, default: false, require: true },
    success: { type: Boolean, default: false, require: true },
    fail: { type: Boolean, default: true, require: true }
});
exports.default = (0, mongoose_1.model)("Payment", PaymentSchema);
