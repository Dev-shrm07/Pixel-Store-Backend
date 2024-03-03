"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostSchema = void 0;
const mongoose_1 = require("mongoose");
exports.PostSchema = new mongoose_1.Schema({
    image: { type: String, require: true },
    image_watermark: { type: String, require: true },
    likes: { type: Number, default: 0, require: true },
    price: { type: Number, require: true },
    category: { type: String, require: true },
    title: { type: String, require: true },
    description: { type: String },
    creator: { type: mongoose_1.Schema.Types.ObjectId, require: true }
}, {
    timestamps: true
});
