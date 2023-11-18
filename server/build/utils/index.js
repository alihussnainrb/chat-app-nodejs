"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.excludeObjectField = void 0;
function excludeObjectField(object, keys) {
    try {
        return Object.fromEntries(Object.entries(object).filter(([key]) => !keys.includes(key)));
    }
    catch (error) {
        return {};
    }
}
exports.excludeObjectField = excludeObjectField;
