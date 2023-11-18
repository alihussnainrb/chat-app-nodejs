"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBaseRouteHandler = exports.createExpressHandler = exports.validateDataWithZSchema = void 0;
const utils_1 = require("../utils");
async function validateDataWithZSchema(data, schema) {
    if (!schema)
        return data;
    try {
        const parsedData = await schema.parseAsync(data);
        return parsedData;
    }
    catch (error) {
        return null;
    }
}
exports.validateDataWithZSchema = validateDataWithZSchema;
function createExpressHandler(route) {
    return async (expressReq, expressRes) => {
        var _a;
        if (route.requireAuth &&
            (!expressReq.authUser || !((_a = expressReq.authUser) === null || _a === void 0 ? void 0 : _a.id))) {
            return expressRes
                .status(200)
                .send({
                succeed: false,
                reason: "UNAUTHORIZED",
            })
                .end();
        }
        await createBaseRouteHandler(Object.assign(Object.assign({}, route), { req: {
                body: expressReq.body,
                params: expressReq.params,
                query: expressReq.query,
                authUser: expressReq.authUser,
            }, respond: (res) => {
                if (res.cookie) {
                    expressRes.cookie(res.cookie.name, res.cookie.value, {
                        maxAge: 24 * 60 * 60 * 1000,
                    });
                }
                expressRes
                    .status(200)
                    .send((0, utils_1.excludeObjectField)(res, ["cookie"]))
                    .end();
            } }));
    };
}
exports.createExpressHandler = createExpressHandler;
async function createBaseRouteHandler({ validate, handler, req, respond, }) {
    // Validating Request Body
    const validatedBody = await validateDataWithZSchema(req.body, validate === null || validate === void 0 ? void 0 : validate.body);
    if ((validate === null || validate === void 0 ? void 0 : validate.body) && !validatedBody) {
        return respond({
            succeed: false,
            reason: "BAD_REQUEST",
        });
    }
    // Validating Request Params
    const validatedParams = await validateDataWithZSchema(req.params, validate === null || validate === void 0 ? void 0 : validate.params);
    if ((validate === null || validate === void 0 ? void 0 : validate.params) && !validatedParams) {
        return respond({
            succeed: false,
            reason: "BAD_REQUEST",
        });
    }
    // Validating Request Query
    const validatedQuery = await validateDataWithZSchema(req.query, validate === null || validate === void 0 ? void 0 : validate.query);
    if ((validate === null || validate === void 0 ? void 0 : validate.query) && !validatedQuery) {
        return respond({
            succeed: false,
            reason: "BAD_REQUEST",
        });
    }
    // Hadnling and Validating Handler Response
    try {
        const response = await handler({
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
}
exports.createBaseRouteHandler = createBaseRouteHandler;
