import { RequestHandler } from "express";
import PostModel from "../models/post";
import createHttpError from "http-errors";

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
