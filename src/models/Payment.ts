import { InferSchemaType, Model, Schema, model } from "mongoose";

const PaymentSchema = new Schema({
    post:{type:Schema.ObjectId, require:true},
    user:{type:Schema.ObjectId,require:true},
    session_id:{type:String,require:true},
    completed:{type:Boolean, default:false, require:true},
    success:{type:Boolean, default:false, require:true},
    fail:{type:Boolean, default:true, require:true}
})

type Payment = InferSchemaType<typeof PaymentSchema>

export default model<Payment>("Payment", PaymentSchema)