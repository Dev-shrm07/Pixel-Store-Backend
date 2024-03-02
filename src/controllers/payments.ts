import { RequestHandler } from "express";
import UserModel from "../models/user";
import createHttpError from "http-errors";
import stripe from "../utils/stripe";
import AccountModel from "../models/ConnectedAccount";
import env from "../utils/validateENV";
import { trusted } from "mongoose";

export const RegisterUser: RequestHandler = async (req, res, next) => {
  const userid = req.session.userID;
  if (!userid) {
    throw createHttpError(404, "No user logged in");
  }
  const user = await UserModel.findOne({ _id: userid }).exec();
  if (!user) {
    throw createHttpError(404, "No user found");
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
        registered:false
      });
    } else if (account.registered) {
      throw createHttpError(401, "You have already completed registration");
    }
    const accountLink = await stripe.accountLinks.create({
      account: account!.id,
      refresh_url: 'http://localhost:3000/register',
      return_url: `http://localhost:3000/getStatus/${userid}`,
      type: 'account_onboarding',
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
      }
      const valid_details = event.data.object.details_submitted;
      const payouts = event.data.object.payouts_enabled
      const charges = event.data.object.charges_enabled
      Model.completed = valid_details;
      Model.registered=(valid_details&&charges&&payouts)
      const user = await UserModel.findOne({ _id: Model.user }).exec();
      if (!user) {
        throw createHttpError(402, "No user found");
      }
      user.reg_seller = (valid_details&&charges&&payouts);
      await user.save();
      await Model.save();

      break;

    default:
      console.log(`Unhandled event type ${event?.type}.`);
  }
  res.setHeader("Cache-Control", "no-store, no-cache, private");
  res.status(201).json({ success: true });
};


export const getStatus: RequestHandler = async (req, res, next) => {
  const user = req.session.userID;
  if (!user) {
    throw createHttpError(404, "No session found");
  }
  try {
    const User = await UserModel.findOne({ _id: user }).exec();
    if (!User) {
      throw createHttpError(404, "No User Found");
    }
    const Account = await AccountModel.findOne({ user: user }).exec();
    if (!Account) {
      throw createHttpError(404, "Not yet registered");
    }
    const acc_id = Account.id
    const resx = await stripe.accounts.retrieve(acc_id)
    const details = resx.details_submitted
    const charges = resx.charges_enabled
    const payout = resx.payouts_enabled
    const valid = details && charges && payout
    Account.completed = details
    Account.registered=valid
    User.reg_seller = valid
    await User.save()
    await Account.save()
    res.setHeader("Cache-Control", "no-store, no-cache, private");
    res.status(201).json(Account);
  } catch (error) {
    next(error);
  }
};


