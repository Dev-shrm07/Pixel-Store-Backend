import { Router } from "express";
import * as PostController from "../controllers/post"
import { getPosts } from "../controllers/welcome";

const router = Router()
router.get("/mycollection", PostController.getMyCreatedPosts)
router.post("/", PostController.createPost)
router.get("/saved", PostController.getSavedPosts)
router.get("/:postid", PostController.getPostByID)
router.delete("/:postid", PostController.deletePost)
router.delete("/", PostController.deleteMany)
router.patch("/:postid", PostController.updatePost)
router.post("/save/:postid", PostController.savePost)

export default router