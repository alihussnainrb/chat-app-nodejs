"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = require("jsonwebtoken");
const JWT_SECRET_KEY = (_a = process.env.JWT_SECRET_KEY) !== null && _a !== void 0 ? _a : "kajskajskajskajsk";
async function verifyToken(token) {
    return await new Promise((resolve) => {
        (0, jsonwebtoken_1.verify)(token, JWT_SECRET_KEY, (err, decoded) => {
            if (err || !decoded) {
                resolve(null);
            }
            resolve(decoded);
        });
    });
}
async function generateToken(payload) {
    return await new Promise((resolve) => {
        (0, jsonwebtoken_1.sign)(payload, JWT_SECRET_KEY, { expiresIn: "24h" }, (err, token) => {
            if (err || !token) {
                resolve(null);
            }
            resolve(token);
        });
    });
}
const jwt = {
    verifyToken,
    generateToken,
};
exports.default = jwt;
