"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertIsDefined = void 0;
function assertIsDefined(val) {
    if (!val) {
        throw Error("expected val to be recived but recieved " + val);
    }
}
exports.assertIsDefined = assertIsDefined;
