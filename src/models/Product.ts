import { InferSchemaType, Model, Schema, model } from "mongoose";

const ProductSchema = new Schema({
    post:{type:Schema.ObjectId, require:true},
    product_id:{type:String, require:true},
    price_id:{type:String, require:true}
})

type Product = InferSchemaType<typeof ProductSchema>

export default model<Product>("Product", ProductSchema)