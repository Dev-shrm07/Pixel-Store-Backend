import { RequestHandler } from "express";
import UserModel from "../models/user";
import createHttpError from "http-errors";
import stripe from "../utils/stripe";
import AccountModel from "../models/ConnectedAccount";
import PostModel from "../models/post";
import env from "../utils/validateENV";
import { trusted } from "mongoose";
import { assertIsDefined } from "../utils/assertisDefined";
import ProductModel from "../models/Product";
import PaymentModel from "../models/Payment";

export const RegisterUser: RequestHandler = async (req, res, next) => {
  const userid = req.session.userID;
  assertIsDefined(userid);
  const user = await UserModel.findOne({ _id: userid }).exec();
  if (!user) {
    throw createHttpError(404, "No user found");
    return;
  }

  try {
    let account;
    account = await AccountModel.findOne({ user: userid }).exec();
    if (!account) {
      account = await stripe.accounts.create({
        type: "standard",
        email: user.email,
      });
      const accoundModel = await AccountModel.create({
        user: userid,
        id: account.id,
        completed: false,
        registered: false,
      });
    } else if (account.registered) {
      throw createHttpError(401, "You have already completed registration");
      return;
    }
    const accountLink = await stripe.accountLinks.create({
      account: account!.id,
      refresh_url: "http://localhost:3000/register",
      return_url: `http://localhost:3000/getStatus/${userid}`,
      type: "account_onboarding",
    });
    res.setHeader("Cache-Control", "no-store, no-cache, private");
    res.status(201).json(accountLink);
  } catch (error) {
    next(error);
  }
};

export const HandlWebhooks: RequestHandler = async (req, res, next) => {
  const key = env.STRIPE_WEBHOOK_KEY;
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig!, key);
  } catch (error) {
    console.error("Webhook processing failed:");
    res.setHeader("Cache-Control", "no-store, no-cache, private");
    res.status(500).json({ success: false });
  }

  switch (event?.type) {
    case "account.updated":
      const id = event.data.object.id;
      const Model = await AccountModel.findOne({ id: id }).exec();

      if (!Model) {
        throw createHttpError(401, "No account found");
        return
      }
      const valid_details = event.data.object.details_submitted;
      const payouts = event.data.object.payouts_enabled;
      const charges = event.data.object.charges_enabled;
      Model.completed = valid_details;
      Model.registered = valid_details && charges && payouts;
      const user = await UserModel.findOne({ _id: Model.user }).exec();
      if (!user) {
        throw createHttpError(402, "No user found");
        return;
      }
      user.reg_seller = valid_details && charges && payouts;
      await user.save();
      await Model.save();

      break;
    case "checkout.session.completed":
      const cid = event.data.object.id;
      const Paymentx = await PaymentModel.findOne({ session_id: cid }).exec();
      if (!Paymentx) {
        throw createHttpError(404, "INvalid");
        return
      }
      if (Paymentx) {
        Paymentx.completed = true;
      }
      if (event.data.object.payment_status == "paid" && Paymentx) {
        Paymentx.success = true;
      }

      await Paymentx?.save();
      break
    case "checkout.session.async_payment_succeeded":
      const sid = event.data.object.id;
      const Paymenty = await PaymentModel.findOne({ session_id: sid }).exec();
      if (!Paymenty) {
        throw createHttpError(404, "INvalid");
      }
      if (Paymenty) {
        Paymenty.completed = true;
        Paymenty.success = true;
      }

      await Paymenty?.save();
      break

    case "checkout.session.async_payment_failed":
      const siid = event.data.object.id;
      const Paymentz = await PaymentModel.findOne({ session_id: siid }).exec();
      if (!Paymentz) {
        throw createHttpError(404, "INvalid");
      }
      if (Paymentz) {
        Paymentz.fail = false;
      }
      await Paymentz?.save();
      break

    default:
      console.log(`Unhandled event type ${event?.type}.`);
  }
  res.setHeader("Cache-Control", "no-store, no-cache, private");
  res.status(201).json({ success: true });
};

export const getStatus: RequestHandler = async (req, res, next) => {
  const user = req.session.userID;
  assertIsDefined(user);
  try {
    const User = await UserModel.findOne({ _id: user }).exec();
    if (!User) {
      throw createHttpError(404, "No User Found");
      return;
    }
    const Account = await AccountModel.findOne({ user: user }).exec();
    if (!Account) {
      throw createHttpError(404, "Not yet registered");
      return;
    }
    const acc_id = Account.id;
    const resx = await stripe.accounts.retrieve(acc_id);
    const details = resx.details_submitted;
    const charges = resx.charges_enabled;
    const payout = resx.payouts_enabled;
    const valid = details && charges && payout;
    Account.completed = details;
    Account.registered = valid;
    User.reg_seller = valid;
    await User.save();
    await Account.save();
    res.setHeader("Cache-Control", "no-store, no-cache, private");
    res.status(201).json(Account);
  } catch (error) {
    next(error);
  }
};

export interface SessionParams {
  postid: string;
}



export const CreateSession: RequestHandler<
  SessionParams,
  unknown,
  unknown,
  unknown
> = async (req, res, next) => {
  const userid = req.session.userID;
  const postid = req.params.postid;

  assertIsDefined(userid);
  assertIsDefined(postid);
  try {
    const User = await UserModel.findOne({ _id: userid }).exec();
    if (!User) {
      next(createHttpError(400, "No User Found"));
    }
    const Post = await PostModel.findOne({ _id: postid }).exec();
    if (!Post) {
      next(createHttpError(401, "No post found"));
    }
    const Product = await ProductModel.findOne({ post: postid }).exec();
    if (!Product) {
      next(createHttpError(402, "No corresponding product found"));
    }
    const CA = await AccountModel.findOne({user:Post?.creator}).exec()
    if(!CA){
      next(createHttpError(403, "No connected account of merhcant"))
    }
    const id1 = "65ce0b32031a32abb5dc20d3"
    const id2 = "65ce0cd88022723a7d119a07"
    
    const evalz:boolean = (postid==id1||postid==id2)
    
    let session;
    if(evalz){
      session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [
          {
            price: Product?.price_id,
            quantity: 1,
          },
        ],
        success_url: "http://localhost:3000/payment/success/" + postid,
        cancel_url: "http://localhost:3000/detail/" + postid,
      });
    }else{
      session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [
          {
            price: Product?.price_id,
            quantity: 1,
          },
        ],
        payment_intent_data: {
          application_fee_amount: 0,
          transfer_data: {
            destination: CA?.id,
          },
        },
        success_url: "https://pixelstorezy.netlify.app/payment/success/" + postid,
        cancel_url: "https://pixelstorezy.netlify.app/detail/" + postid,
      });
    }
    
    

    const sid = session.id;
    const del = await PaymentModel.deleteMany({ user: userid, post: postid });
    const Paymentr = await PaymentModel.create({
      post: postid,
      session_id: sid,
      completed: false,
      success: false,
      fail: true,
      user: userid,
    });
    res.setHeader("Cache-Control", "no-store, no-cache, private");
    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
};

interface PaymentParams {
  postid: string;
}

interface ReturnData {
  image?: string;
  success?: boolean;
  completed?: boolean;
}

export const CheckStatus: RequestHandler<
  PaymentParams,
  unknown,
  ReturnData,
  unknown
> = async (req, res, next) => {
  const id = req.params.postid;
  const user = req.session.userID;
  assertIsDefined(user);
  try {
    const PM = await PaymentModel.findOne({ post: id, user: user }).exec();

    if (!PM) {
      throw createHttpError(402, "No payment");
      return;
    }

    const Pm = await stripe.checkout.sessions.retrieve(PM?.session_id!);

    const Post = await PostModel.findOne({ _id: PM?.post }).exec();
    if (!Post) {
      throw createHttpError(404, "invalid");
      return;
    }
    if (!PM) {
      throw createHttpError(404, "Invalid");
      return;
    }
    if (Pm?.payment_status == "paid" && PM) {
      PM.success = true;
      PM.completed = true;
    }
    await PM?.save();
    const data: ReturnData = {
      success: PM?.success,
      completed: PM?.completed,
    };
    if (PM?.success) {
      data.image = Post?.image;
    }
    res.setHeader("Cache-Control", "no-store, no-cache, private");
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};
