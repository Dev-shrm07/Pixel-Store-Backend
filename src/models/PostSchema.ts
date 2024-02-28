import mongoose, { Schema } from "mongoose";

export const PostSchema = new Schema({
    image: { type: String, require: true },
    image_watermark: { type: String, require: true },
    likes: { type: Number, default: 0, require:true},
    price:{type:Number, require: true},
    category: {type: String, require: true},
    title: { type: String, require: true },
    description: { type: String },
    creator :{type:Schema.Types.ObjectId, require:true}
}, {
    timestamps: true
});
