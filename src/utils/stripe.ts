import env from "./validateENV"
import Stripe from "stripe"

const stripe = new Stripe(env.STRIPE_SECRET_TEST_KEY)

export default stripe