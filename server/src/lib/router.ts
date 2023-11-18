import { ZodAny, ZodSchema } from "zod";
import { ZApiResponse, ZRoute, ZRouteHandlerParams } from "../typing/router";
import { RequestHandler } from "express";
import { excludeObjectField } from "@/utils";

export async function validateDataWithZSchema(data: any, schema?: ZodSchema) {
  if (!schema) return data;
  try {
    const parsedData = await schema.parseAsync(data);
    return parsedData;
  } catch (error) {
    return null;
  }
}

export function createExpressHandler<
  TBody extends ZodSchema = ZodAny,
  TParams extends ZodSchema = ZodAny,
  TQuery extends ZodSchema = ZodAny,
  TResp extends ZodSchema = ZodAny,
  TAuth extends boolean = false
>(route: ZRoute<TBody, TParams, TQuery, TResp, TAuth>): RequestHandler {
  return async (expressReq, expressRes) => {
    if (
      route.requireAuth &&
      (!expressReq.authUser || !expressReq.authUser?.id)
    ) {
      return expressRes
        .status(200)
        .send({
          succeed: false,
          reason: "UNAUTHORIZED",
        } satisfies ZApiResponse)
        .end();
    }
    await createBaseRouteHandler({
      ...route,
      req: {
        body: expressReq.body,
        params: expressReq.params,
        query: expressReq.query,
        authUser: expressReq.authUser,
      },
      respond: (res) => {
        if (res.cookie) {
          expressRes.cookie(res.cookie.name, res.cookie.value, {
            maxAge: 24 * 60 * 60 * 1000,
          });
        }
        expressRes
          .status(200)
          .send(excludeObjectField(res, ["cookie"]))
          .end();
      },
    });
  };
}

export async function createBaseRouteHandler<
  TBody extends ZodSchema,
  TParams extends ZodSchema,
  TQuery extends ZodSchema,
  TResp extends ZodSchema,
  TAuth extends boolean
>({
  validate,
  handler,
  req,
  respond,
}: ZRoute<TBody, TParams, TQuery, TResp, TAuth> & ZRouteHandlerParams) {
  // Validating Request Body
  const validatedBody = await validateDataWithZSchema(req.body, validate?.body);
  if (validate?.body && !validatedBody) {
    return respond({
      succeed: false,
      reason: "BAD_REQUEST",
    });
  }
  // Validating Request Params
  const validatedParams = await validateDataWithZSchema(
    req.params,
    validate?.params
  );
  if (validate?.params && !validatedParams) {
    return respond({
      succeed: false,
      reason: "BAD_REQUEST",
    });
  }
  // Validating Request Query
  const validatedQuery = await validateDataWithZSchema(
    req.query,
    validate?.query
  );
  if (validate?.query && !validatedQuery) {
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
      authUser: req.authUser as any,
    });
    if (!response) return;
    const validatedResData = validateDataWithZSchema(
      response.data,
      validate?.response
    );
    if (validate?.response && !validatedResData) {
      return respond({
        succeed: false,
        reason: "BAD_REQUEST",
      });
    }
    return respond(response);
  } catch (error) {
    return respond({
      succeed: false,
      reason: "INTERNAL_SERVER_ERROR",
    });
  }
}
