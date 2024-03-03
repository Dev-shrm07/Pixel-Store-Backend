"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const envalid_1 = require("envalid");
require("dotenv/config");
const validators_1 = require("envalid/dist/validators");
exports.default = (0, envalid_1.cleanEnv)(process.env, {
    MONGO_CONNECTION_STRING: (0, validators_1.str)(),
    STRIPE_PUBLIC_TEST_KEY: (0, validators_1.str)(),
    STRIPE_SECRET_TEST_KEY: (0, validators_1.str)(),
    SESSION_SECRET: (0, validators_1.str)(),
    STRIPE_WEBHOOK_KEY: (0, validators_1.str)()
});
