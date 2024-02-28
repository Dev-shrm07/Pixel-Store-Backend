import { InferSchemaType, model } from "mongoose";
import { PostSchema } from "./PostSchema";

type Post = InferSchemaType<typeof PostSchema>

export default model<Post>("Post", PostSchema)