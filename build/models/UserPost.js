"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const UPSchema = new mongoose_1.Schema({
    post: { type: mongoose_1.Schema.ObjectId, require: true },
    user: { type: mongoose_1.Schema.ObjectId, require: true },
    payment_id: { type: mongoose_1.Schema.ObjectId, require: true }
});
exports.default = (0, mongoose_1.model)("UP", UPSchema);
