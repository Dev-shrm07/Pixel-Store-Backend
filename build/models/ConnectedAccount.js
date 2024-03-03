"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const AccountSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, require: true },
    id: { type: String, require: true },
    completed: { type: Boolean, require: true, default: false },
    registered: { type: Boolean, require: true, default: false }
});
exports.default = (0, mongoose_1.model)("Account", AccountSchema);
