import { Router } from "express";
import * as UserController from "../controllers/user"
import { requireUserAuth } from "../middlewares/auth";

const router = Router()

router.post("/signup", UserController.Signup)
router.post("/login", UserController.Login)
router.post("/logout", UserController.Logout)
router.get("/", requireUserAuth, UserController.getauthUser)
router.patch("/setseller",UserController.setRegSeller )
router.patch("/editusername",UserController.EditUser)

export default router