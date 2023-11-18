import { ZodSchema, z } from "zod";
import { SessionUser } from "./express";
export type ZReqMethod = "GET" | "POST" | "DELETE" | "PUT" | "PATCH";

export type ZRequestContext<
  TBody extends ZodSchema,
  TParams extends ZodSchema,
  TQuery extends ZodSchema,
  TAuth extends boolean
> = {
  body: z.infer<TBody>;
  params: z.infer<TParams>;
  query: z.infer<TQuery>;
  authUser: TAuth extends true ? SessionUser : SessionUser | undefined | null;
};

export type ZValidate<
  TBody extends ZodSchema,
  TParams extends ZodSchema,
  TQuery extends ZodSchema,
  TResp extends ZodSchema
> = {
  body?: TBody;
  params?: TParams;
  query?: TQuery;
  response?: TResp;
};

export type ZRequestHandler<
  TBody extends ZodSchema,
  TParams extends ZodSchema,
  TQuery extends ZodSchema,
  TResp extends ZodSchema,
  TAuth extends boolean
> = (
  ctx: ZRequestContext<TBody, TParams, TQuery, TAuth>
) => Promise<ZApiResponse<z.infer<TResp>>> | ZApiResponse<z.infer<TResp>>;

export type ZRoute<
  TBody extends ZodSchema,
  TParams extends ZodSchema,
  TQuery extends ZodSchema,
  TResp extends ZodSchema,
  TAuth extends boolean
> = {
  requireAuth?: TAuth;
  validate?: ZValidate<TBody, TParams, TQuery, TResp>;
  handler: ZRequestHandler<TBody, TParams, TQuery, TResp, TAuth>;
};

export type ZRouteHandlerParams = {
  req: {
    body: any;
    params: any;
    query: any;
    authUser?: SessionUser | null;
  };
  respond: (res: ZApiResponse) => void;
};

type ZRequestFailedReason =
  | "NOT_FOUND"
  | "WRONG_PASSWORD"
  | "DUPLICATE"
  | "INTERNAL_SERVER_ERROR"
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "SESSION_EXPIRED";

export type ZApiResponse<TData = any> = {
  message?: string;
  cookie?: {
    name: string;
    value: string;
  };
} & (
  | { succeed: false; data?: TData | null; reason: ZRequestFailedReason }
  | { succeed: true; data: TData }
);
