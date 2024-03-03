"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    email: { type: String, require: true },
    password: { type: String, require: true },
    username: { type: String, require: true, maxlength: 100 },
    savedPosts: [{
            type: mongoose_1.Schema.Types.ObjectId, require: true
        }],
    reg_seller: { type: Boolean, require: true }
});
exports.default = (0, mongoose_1.model)("User", UserSchema);
