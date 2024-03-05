"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckStatus = exports.CreateSession = exports.getStatus = exports.HandlWebhooks = exports.RegisterUser = void 0;
const user_1 = __importDefault(require("../models/user"));
const http_errors_1 = __importDefault(require("http-errors"));
const stripe_1 = __importDefault(require("../utils/stripe"));
const ConnectedAccount_1 = __importDefault(require("../models/ConnectedAccount"));
const post_1 = __importDefault(require("../models/post"));
const validateENV_1 = __importDefault(require("../utils/validateENV"));
const assertisDefined_1 = require("../utils/assertisDefined");
const Product_1 = __importDefault(require("../models/Product"));
const Payment_1 = __importDefault(require("../models/Payment"));
const RegisterUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userid = req.session.userID;
    (0, assertisDefined_1.assertIsDefined)(userid);
    const user = yield user_1.default.findOne({ _id: userid }).exec();
    if (!user) {
        throw (0, http_errors_1.default)(404, "No user found");
        return;
    }
    try {
        let account;
        account = yield ConnectedAccount_1.default.findOne({ user: userid }).exec();
        if (!account) {
            account = yield stripe_1.default.accounts.create({
                type: "standard",
                email: user.email,
            });
            const accoundModel = yield ConnectedAccount_1.default.create({
                user: userid,
                id: account.id,
                completed: false,
                registered: false,
            });
        }
        else if (account.registered) {
            throw (0, http_errors_1.default)(401, "You have already completed registration");
            return;
        }
        const accountLink = yield stripe_1.default.accountLinks.create({
            account: account.id,
            refresh_url: "http://localhost:3000/register",
            return_url: `http://localhost:3000/getStatus/${userid}`,
            type: "account_onboarding",
        });
        res.setHeader("Cache-Control", "no-store, no-cache, private");
        res.status(201).json(accountLink);
    }
    catch (error) {
        next(error);
    }
});
exports.RegisterUser = RegisterUser;
const HandlWebhooks = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const key = validateENV_1.default.STRIPE_WEBHOOK_KEY;
    const sig = req.headers["stripe-signature"];
    let event;
    try {
        event = stripe_1.default.webhooks.constructEvent(req.body, sig, key);
    }
    catch (error) {
        console.error("Webhook processing failed:");
        res.setHeader("Cache-Control", "no-store, no-cache, private");
        res.status(500).json({ success: false });
    }
    switch (event === null || event === void 0 ? void 0 : event.type) {
        case "account.updated":
            const id = event.data.object.id;
            const Model = yield ConnectedAccount_1.default.findOne({ id: id }).exec();
            if (!Model) {
                throw (0, http_errors_1.default)(401, "No account found");
            }
            const valid_details = event.data.object.details_submitted;
            const payouts = event.data.object.payouts_enabled;
            const charges = event.data.object.charges_enabled;
            Model.completed = valid_details;
            Model.registered = valid_details && charges && payouts;
            const user = yield user_1.default.findOne({ _id: Model.user }).exec();
            if (!user) {
                throw (0, http_errors_1.default)(402, "No user found");
                return;
            }
            user.reg_seller = valid_details && charges && payouts;
            yield user.save();
            yield Model.save();
            break;
        case "checkout.session.completed":
            const cid = event.data.object.id;
            const Paymentx = yield Payment_1.default.findOne({ session_id: cid }).exec();
            if (!Paymentx) {
                next((0, http_errors_1.default)(404, "INvalid"));
            }
            if (Paymentx) {
                Paymentx.completed = true;
            }
            if (event.data.object.payment_status == "paid" && Paymentx) {
                Paymentx.success = true;
            }
            yield (Paymentx === null || Paymentx === void 0 ? void 0 : Paymentx.save());
        case "checkout.session.async_payment_succeeded":
            const sid = event.data.object.id;
            const Paymenty = yield Payment_1.default.findOne({ session_id: sid }).exec();
            if (!Paymenty) {
                next((0, http_errors_1.default)(404, "INvalid"));
            }
            if (Paymenty) {
                Paymenty.completed = true;
                Paymenty.success = true;
            }
            yield (Paymenty === null || Paymenty === void 0 ? void 0 : Paymenty.save());
        case "checkout.session.async_payment_failed":
            const siid = event.data.object.id;
            const Paymentz = yield Payment_1.default.findOne({ session_id: siid }).exec();
            if (!Paymentz) {
                next((0, http_errors_1.default)(404, "INvalid"));
            }
            if (Paymentz) {
                Paymentz.fail = false;
            }
            yield (Paymentz === null || Paymentz === void 0 ? void 0 : Paymentz.save());
        default:
            console.log(`Unhandled event type ${event === null || event === void 0 ? void 0 : event.type}.`);
    }
    res.setHeader("Cache-Control", "no-store, no-cache, private");
    res.status(201).json({ success: true });
});
exports.HandlWebhooks = HandlWebhooks;
const getStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.session.userID;
    (0, assertisDefined_1.assertIsDefined)(user);
    try {
        const User = yield user_1.default.findOne({ _id: user }).exec();
        if (!User) {
            throw (0, http_errors_1.default)(404, "No User Found");
            return;
        }
        const Account = yield ConnectedAccount_1.default.findOne({ user: user }).exec();
        if (!Account) {
            throw (0, http_errors_1.default)(404, "Not yet registered");
            return;
        }
        const acc_id = Account.id;
        const resx = yield stripe_1.default.accounts.retrieve(acc_id);
        const details = resx.details_submitted;
        const charges = resx.charges_enabled;
        const payout = resx.payouts_enabled;
        const valid = details && charges && payout;
        Account.completed = details;
        Account.registered = valid;
        User.reg_seller = valid;
        yield User.save();
        yield Account.save();
        res.setHeader("Cache-Control", "no-store, no-cache, private");
        res.status(201).json(Account);
    }
    catch (error) {
        next(error);
    }
});
exports.getStatus = getStatus;
const CreateSession = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userid = req.session.userID;
    const postid = req.params.postid;
    (0, assertisDefined_1.assertIsDefined)(userid);
    (0, assertisDefined_1.assertIsDefined)(postid);
    try {
        const User = yield user_1.default.findOne({ _id: userid }).exec();
        if (!User) {
            next((0, http_errors_1.default)(400, "No User Found"));
        }
        const Post = yield post_1.default.findOne({ _id: postid }).exec();
        if (!Post) {
            next((0, http_errors_1.default)(401, "No post found"));
        }
        const Product = yield Product_1.default.findOne({ post: postid }).exec();
        if (!Product) {
            next((0, http_errors_1.default)(402, "No corresponding product found"));
        }
        const CA = yield ConnectedAccount_1.default.findOne({ user: Post === null || Post === void 0 ? void 0 : Post.creator }).exec();
        if (!CA) {
            next((0, http_errors_1.default)(403, "No connected account of merhcant"));
        }
        const session = yield stripe_1.default.checkout.sessions.create({
            mode: "payment",
            line_items: [
                {
                    price: Product === null || Product === void 0 ? void 0 : Product.price_id,
                    quantity: 1,
                },
            ],
            payment_intent_data: {
                application_fee_amount: 0,
                transfer_data: {
                    destination: CA === null || CA === void 0 ? void 0 : CA.id,
                },
            },
            success_url: "https://pixelstorezy.netlify.app/payment/success/" + postid,
            cancel_url: "https://pixelstorezy.netlify.app/detail/" + postid,
        });
        const sid = session.id;
        const del = yield Payment_1.default.deleteMany({ user: userid, post: postid });
        const Paymentr = yield Payment_1.default.create({
            post: postid,
            session_id: sid,
            completed: false,
            success: false,
            fail: true,
            user: userid,
        });
        res.setHeader("Cache-Control", "no-store, no-cache, private");
        res.status(201).json(session);
    }
    catch (error) {
        next(error);
    }
});
exports.CreateSession = CreateSession;
const CheckStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.postid;
    const user = req.session.userID;
    (0, assertisDefined_1.assertIsDefined)(user);
    try {
        const PM = yield Payment_1.default.findOne({ post: id, user: user }).exec();
        if (!PM) {
            throw (0, http_errors_1.default)(402, "No payment");
            return;
        }
        const Pm = yield stripe_1.default.checkout.sessions.retrieve(PM === null || PM === void 0 ? void 0 : PM.session_id);
        const Post = yield post_1.default.findOne({ _id: PM === null || PM === void 0 ? void 0 : PM.post }).exec();
        if (!Post) {
            throw (0, http_errors_1.default)(404, "invalid");
            return;
        }
        if (!PM) {
            throw (0, http_errors_1.default)(404, "Invalid");
            return;
        }
        if ((Pm === null || Pm === void 0 ? void 0 : Pm.payment_status) == "paid" && PM) {
            PM.success = true;
            PM.completed = true;
        }
        yield (PM === null || PM === void 0 ? void 0 : PM.save());
        const data = {
            success: PM === null || PM === void 0 ? void 0 : PM.success,
            completed: PM === null || PM === void 0 ? void 0 : PM.completed,
        };
        if (PM === null || PM === void 0 ? void 0 : PM.success) {
            data.image = Post === null || Post === void 0 ? void 0 : Post.image;
        }
        res.setHeader("Cache-Control", "no-store, no-cache, private");
        res.status(201).json(data);
    }
    catch (error) {
        next(error);
    }
});
exports.CheckStatus = CheckStatus;
