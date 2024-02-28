import { InferSchemaType, Model, Schema, model } from "mongoose";

const UserSchema = new Schema({
    email:{type:String, require:true},
    password:{type:String, require:true},
    username:{type:String, require:true, maxlength:100},
    savedPosts:[{
        type: Schema.Types.ObjectId, require:true
    }],
    reg_seller:{type:Boolean, require:true}  
})

type User = InferSchemaType<typeof UserSchema>

export default model<User>("User", UserSchema)