type RequestFailedReason =
  | "NOT_FOUND"
  | "WRONG_PASSWORD"
  | "DUPLICATE"
  | "INTERNAL_SERVER_ERROR"
  | "CLIENT_ERROR"
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "SESSION_EXPIRED";

export type ApiResponse<TData = any> = {
  message?: string;
} & (
  | { succeed: false; data?: TData | null; reason: RequestFailedReason }
  | { succeed: true; data: TData }
);
