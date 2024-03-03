import express from "express";
import env from "./utils/validateENV";
import cors from "cors";
import { requireUserAuth } from "./middlewares/auth";
import { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import createHttpError, { isHttpError } from "http-errors";
import PostRoutes from "./routes/post";
import PaymentRoutes from "./routes/payments"
import stripe from "./utils/stripe";
import WelcomeRoutes from "./routes/welcome"
import UserRoutes from "./routes/user";
import bodyParser from "body-parser";
import session from "express-session";
import "dotenv/config"
import MongoStore from "connect-mongo";


const app = express();

app.set("trust proxy", 1);

app.use(
  session({
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 60 * 60 * 1000,
      secure: true,
      httpOnly: false,
      sameSite: "none",
    },
    rolling: true,
    store: MongoStore.create({
      mongoUrl: env.MONGO_CONNECTION_STRING,
    }),
  })
);

app.use(
  cors({
    origin:["https://pixelstoreindx.netlify.app/","http://localhost:3000/"],
    credentials:true
  })
);

app.use(morgan("dev"));
app.use("/api/payments", PaymentRoutes)
app.use(bodyParser.json({ limit: "500mb" }));

app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: "35mb",
    parameterLimit: 50000,
  })
);

app.use(express.json());




app.use("/api/user", UserRoutes);
app.use("/api/posts", requireUserAuth, PostRoutes);
app.use("/welcome", WelcomeRoutes)






app.use((req, res, next) => {
  next(createHttpError(404, "Error not found"));
});

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  //console.error(error);
  let errorMessage = "An unknown error occurred";
  let statusCode = 500;

  if (isHttpError(error)) {
    errorMessage = error.message;
    statusCode = error.status;
  }

  res.status(statusCode).json({ error: errorMessage });
});

export default app;
