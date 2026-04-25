"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const functions = require("firebase-functions");
const app_1 = require("./app");
exports.api = functions.https.onRequest(app_1.app);
//# sourceMappingURL=index.js.map