import {Router} from "express"
import * as WC from "../controllers/welcome"

const router = Router()
router.get('/', WC.getPosts)

export default router