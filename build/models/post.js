"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const PostSchema_1 = require("./PostSchema");
exports.default = (0, mongoose_1.model)("Post", PostSchema_1.PostSchema);
