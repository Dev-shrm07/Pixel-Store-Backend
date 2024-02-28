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
    const am = await AccountModel.findOne({ user: userid }).exec();
    if (!am) {
      account = await stripe.accounts.create({
        type: "standard",
        email: user.email,
      });
      const accoundModel = await AccountModel.create({
        user: userid,
        id: account.id,
        completed: false,
      });
    } else if (am.registered) {
      throw createHttpError(401, "You have already completed registration");
    }
    const accountLink = await stripe.accountLinks.create({
      account: account!.id,
      refresh_url: 'https://example.com/reauth',
      return_url: 'https://example.com/return',
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
      const valid = event.data.object.details_submitted;
      Model.completed = valid;
      const user = await UserModel.findOne({ _id: Model.user }).exec();
      if (!user) {
        throw createHttpError(402, "No user found");
      }
      user.reg_seller = valid;
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

    res.setHeader("Cache-Control", "no-store, no-cache, private");
    res.status(201).json(Account);
  } catch (error) {
    next(error);
  }
};
