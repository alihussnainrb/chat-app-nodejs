"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = require("bcryptjs");
const BCRYPT_HASH = 10;
async function hashPassword(password) {
    try {
        return await (0, bcryptjs_1.hash)(password, BCRYPT_HASH);
    }
    catch (error) {
        return null;
    }
}
async function comparePassword(plainPwd, hashedPwd) {
    try {
        return await (0, bcryptjs_1.compare)(plainPwd, hashedPwd);
    }
    catch (error) {
        return false;
    }
}
const bcrypt = {
    hashPassword,
    comparePassword,
};
exports.default = bcrypt;
