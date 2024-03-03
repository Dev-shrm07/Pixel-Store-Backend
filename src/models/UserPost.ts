import { InferSchemaType, Model, Schema, model } from "mongoose";

const UPSchema = new Schema({
    post:{type:Schema.ObjectId, require:true},
    user:{type:Schema.ObjectId, require:true},
    payment_id:{type:Schema.ObjectId,require:true}
})

type UP = InferSchemaType<typeof UPSchema>

export default model<UP>("UP", UPSchema)