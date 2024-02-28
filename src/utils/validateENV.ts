import { cleanEnv } from "envalid";
import "dotenv/config"
import { port, str } from "envalid/dist/validators";

export default cleanEnv(process.env, {
    MONGO_CONNECTION_STRING: str(),
    STRIPE_PUBLIC_TEST_KEY:str(),
    STRIPE_SECRET_TEST_KEY:str(),
    SESSION_SECRET:str(),
    STRIPE_WEBHOOK_KEY:str()
    
    
})