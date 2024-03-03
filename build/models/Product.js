"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ProductSchema = new mongoose_1.Schema({
    post: { type: mongoose_1.Schema.ObjectId, require: true },
    product_id: { type: String, require: true },
    price_id: { type: String, require: true }
});
exports.default = (0, mongoose_1.model)("Product", ProductSchema);
