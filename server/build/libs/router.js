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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBaseRouteHandler = exports.createExpressHandler = exports.validateDataWithZSchema = void 0;
function validateDataWithZSchema(data, schema) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!schema)
            return data;
        try {
            const parsedData = yield schema.parseAsync(data);
            return parsedData;
        }
        catch (error) {
            return null;
        }
    });
}
exports.validateDataWithZSchema = validateDataWithZSchema;
function createExpressHandler(route) {
    return (expressReq, expressRes) => __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (route.requireAuth &&
            (!expressReq.authUser || ((_a = expressReq.authUser) === null || _a === void 0 ? void 0 : _a.id))) {
            return expressRes
                .status(200)
                .send({
                succeed: false,
                reason: "UNAUTHORIZED",
            })
                .end();
        }
        yield createBaseRouteHandler(Object.assign(Object.assign({}, route), { req: {
                body: expressReq.body,
                params: expressReq.params,
                query: expressReq.query,
                authUser: expressReq.authUser,
            }, respond: (res) => expressRes.status(200).send(res).end() }));
    });
}
exports.createExpressHandler = createExpressHandler;
function createBaseRouteHandler({ validate, handler, req, respond, }) {
    return __awaiter(this, void 0, void 0, function* () {
        // Validating Request Body
        const validatedBody = yield validateDataWithZSchema(req.body, validate === null || validate === void 0 ? void 0 : validate.body);
        if ((validate === null || validate === void 0 ? void 0 : validate.body) && !validatedBody) {
            return respond({
                succeed: false,
                reason: "BAD_REQUEST",
            });
        }
        // Validating Request Params
        const validatedParams = yield validateDataWithZSchema(req.params, validate === null || validate === void 0 ? void 0 : validate.params);
        if ((validate === null || validate === void 0 ? void 0 : validate.params) && !validatedParams) {
            return respond({
                succeed: false,
                reason: "BAD_REQUEST",
            });
        }
        // Validating Request Query
        const validatedQuery = yield validateDataWithZSchema(req.query, validate === null || validate === void 0 ? void 0 : validate.query);
        if ((validate === null || validate === void 0 ? void 0 : validate.query) && !validatedQuery) {
            return respond({
                succeed: false,
                reason: "BAD_REQUEST",
            });
        }
        // Hadnling and Validating Handler Response
        try {
            const response = yield handler({
                body: validatedBody,
                params: validatedParams,
                query: validatedQuery,
                authUser: req.authUser,
            });
            if (!response)
                return;
            const validatedResData = validateDataWithZSchema(response.data, validate === null || validate === void 0 ? void 0 : validate.response);
            if ((validate === null || validate === void 0 ? void 0 : validate.response) && !validatedResData) {
                return respond({
                    succeed: false,
                    reason: "BAD_REQUEST",
                });
            }
            return respond(response);
        }
        catch (error) {
            return respond({
                succeed: false,
                reason: "INTERNAL_SERVER_ERROR",
            });
        }
    });
}
exports.createBaseRouteHandler = createBaseRouteHandler;
