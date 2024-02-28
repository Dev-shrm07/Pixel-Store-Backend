import { RequestHandler } from "express";
import PostModel from "../models/post";
import mongoose from "mongoose";
import { assertIsDefined } from "../utils/assertisDefined";
import createHttpError from "http-errors";
import UserModel from "../models/user";

export const getPosts: RequestHandler = async (req, res, next) => {
  try {
    const posts = await PostModel.find(
      {},
      "_id image_watermark title likes category price creator"
    )
      .sort({ timestamps: -1, likes: -1 })
      .exec();
      res.setHeader('Cache-Control', 'no-store, no-cache, private');

    res.status(200).json(posts);
  } catch (error) {
    next(error);
  }
};

export const getPostByID: RequestHandler = async (req, res, next) => {
  const id = req.params.postid;
  try {
    if (!mongoose.isValidObjectId(id)) {
      throw createHttpError(404, "Not a valid id");
    }
    const post = await PostModel.find(
      { _id: id },
      "_id image_watermark title description likes category creator price"
    ).exec();
    if (!post) {
      throw createHttpError(404, "Post Not found");
    }
    res.setHeader('Cache-Control', 'no-store, no-cache, private');

    res.status(200).json(post);
  } catch (error) {
    next(error);
  }
};

interface CreatePost {
  image?: string;
  image_watermark?: string;
  title?: string;
  price?: number;
  description?: string;
  category?: string;
}

interface postresponse {
  image_watermark?: string;
  price?: number;
  _id: mongoose.Types.ObjectId;
  likes?: number;
  title?: string;
  description?: string;
  category?: string;
  creator?: mongoose.Types.ObjectId;
}

export const createPost: RequestHandler<
  unknown,
  unknown,
  CreatePost,
  unknown
> = async (req, res, next) => {
  const image = req.body.image;
  const image_watermark = req.body.image_watermark;
  const likes = 0;
  const price = req.body.price;
  const title = req.body.title;
  const description = req.body.description;
  const category = req.body.category;
  const userid = req.session.userID;
  try {
    assertIsDefined(userid);
    if (!image) {
      next(createHttpError(404, "Image is necessary"));
      return
    }
    if (!title) {
      next(createHttpError(404, "title is necessary"));
      return
    }
    if (!image_watermark) {
      next(createHttpError(404, "image is necessary"));
      return
    }
    if (!category) {
      next(createHttpError(404, "category is necessary"));
      return
    }
    if (!price) {
      next(createHttpError(404, "price is necessary"));
      return
    }

    const user = await UserModel.findById(userid).exec()
    if(!user){
      next(createHttpError(404, "No user found"))
      return
    }
    if(!user?.reg_seller){
      next(createHttpError(404, "Not registered as a seller"))
      return

    }
    const post = await PostModel.create({
      image: image,
      image_watermark: image_watermark,
      likes: likes,
      price: price,
      title: title,
      category: category,
      description: description,
      creator: userid,
    });

    const postResponse: postresponse = {
      _id: post._id,
      image_watermark: post.image_watermark,
      likes: post.likes,
      title: post.title,
      description: post.description,
      category: post.category,
      price: post.price,
      creator: post.creator,
    };
    res.setHeader('Cache-Control', 'no-store, no-cache, private');

    res.status(201).json(postResponse);
  } catch (error) {
    next(error);
  }
};

export const deletePost: RequestHandler = async (req, res, next) => {
  const id = req.params.postid;
  const userid = req.session.userID;
  try {
    assertIsDefined(userid);
    if (!mongoose.isValidObjectId(id)) {
      throw createHttpError(404, "Not a valid post i");
    }
    const post = await PostModel.findOne({ _id: id }).exec();
    if (!post) {
      throw createHttpError(404, "Post not Found");
    }
    const postcreator = post.creator;
    assertIsDefined(postcreator);
    if (!postcreator.equals(userid)) {
      throw createHttpError(401, "User not allowed");
    }
    await PostModel.deleteOne({ _id: id });
    res.setHeader('Cache-Control', 'no-store, no-cache, private');

    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

export const deleteMany: RequestHandler = async (req, res, next) => {
  try {
    await PostModel.deleteMany({});
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

interface updatePostParams {
  postid: string;
}

interface updatePostBody {
  _id?: string,
  image?: string;
  image_watermark?: string;
  title?: string;
  likes?: number;
  price?: number;
  description?: string;
  category?: string;
}

export const updatePost: RequestHandler<
  updatePostParams,
  unknown,
  updatePostBody,
  unknown
> = async (req, res, next) => {
  
  const userid = req.session.userID
  const postid = req.params.postid
  try {
    assertIsDefined(userid)
    if(!mongoose.isValidObjectId(postid)){
      throw createHttpError(401, "invalid req")
      return
    }
    const post = await PostModel.findOne({_id:postid}).exec()
    if(!post){
      throw createHttpError(401, "post not found")
      return
    }
    if(!post.creator?.equals(userid)){
      throw createHttpError(401, "acess not allowed")
      return 
    }
    if(req.body.image && !req.body.image_watermark){
      throw createHttpError(401, "inavlid credintails")
      return
    }
    if(req.body.image && req.body.image!=""){
      post.image = req.body.image
      post.image_watermark = req.body.image_watermark
    }
    if(req.body.price && req.body.price!=0){
      post.price = req.body.price
    }
    if(req.body.title){
      post.title = req.body.title
    }
    if(req.body.category){
      post.category = req.body.category
    }
    await post.save()
    const response:postresponse={
      _id:post._id,
      image_watermark:post.image_watermark,
      likes:post.likes,
      title:post.title,
      description:post.description,
      category:post.category,
      creator:post.creator,
      price:post.price


    }
    res.setHeader('Cache-Control', 'no-store, no-cache, private');
    res.status(200).json(response)
    return
  } catch (error) {
    next(error)
  }
};

interface savedPosts {
  postid: mongoose.Types.ObjectId;
}

export const savePost: RequestHandler<
  savedPosts,
  unknown,
  unknown,
  unknown
> = async (req, res, next) => {
  const authUser = req.session.userID;
  const postId = req.params.postid;
  try {
    assertIsDefined(authUser);
    const User = await UserModel.findById(authUser).exec();
    if (!User) {
      throw createHttpError(404, "invalid request");
    }
    const post = await PostModel.findById(postId).exec();
    if (!post) {
      throw createHttpError(401, "No post found");
    }
    const saveresponse: mongoose.Types.ObjectId = postId;
    const arr = User.savedPosts;
    if(arr.includes(saveresponse)){
      throw createHttpError(401, "Already saved")
    }
    arr.push(saveresponse);
    const Userssaved = await User.save();
    res.setHeader('Cache-Control', 'no-store, no-cache, private');

    res.sendStatus(201);
  } catch (error) {
    next(error);
  }
};

export const getSavedPosts: RequestHandler = async (req, res, next) => {
  try {
    const authuser = req.session.userID;
    assertIsDefined(authuser);
    const User = await UserModel.findOne({ _id: authuser }).exec();
    if (!User) {
      throw createHttpError(404, "User not found");
    }
    const arr = User.savedPosts;
    const result: postresponse[] = [];
    for (const postId of arr) {
      const post = await PostModel.findOne({ _id: postId }).exec();
      if (post) {
        const x: postresponse = {
          _id: post._id,
          image_watermark: post.image_watermark,
          likes: post.likes,
          title: post.title,
          description: post.description,
          category: post.category,
          price: post.price,
          creator: post.creator,
        };
        result.push(x)
      }
    }
    res.setHeader('Cache-Control', 'no-store, no-cache, private');

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getMyCreatedPosts:RequestHandler=async(req,res,next)=>{
  const userid = req.session.userID
  try {
    assertIsDefined(userid)
    const resp = await PostModel.find({creator:userid},'_id image_watermark title likes category price creator').exec()
    res.setHeader('Cache-Control', 'no-store, no-cache, private');
    res.status(200).json(resp)
    return
  } catch (error) {
    next(error)
  }
}