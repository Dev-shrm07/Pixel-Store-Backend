import { Router, application } from "express";
import * as PaymentController from "../controllers/payments"
import { requireUserAuth } from "../middlewares/auth";
import bodyParser from "body-parser";

const router = Router()

router.post('/register', PaymentController.RegisterUser)
router.post('/webhook', bodyParser.raw({type:'application/json'}), PaymentController.HandlWebhooks)
router.get('/status',PaymentController.getStatus)
router.get('/session/:postid',PaymentController.CreateSession)
router.get('/session/status/:postid',PaymentController.CheckStatus)
export default router