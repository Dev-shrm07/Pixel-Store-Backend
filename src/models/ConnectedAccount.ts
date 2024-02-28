import { InferSchemaType, Model, Schema, model } from "mongoose";

const AccountSchema = new Schema({
    user:{type: Schema.Types.ObjectId, require:true},
    id:{type:String, require:true},
    completed:{type:Boolean, require:true, default:false},
    registered:{type:Boolean, require:true, default:false}
})

type Account = InferSchemaType<typeof AccountSchema>

export default model<Account>("Account",AccountSchema)