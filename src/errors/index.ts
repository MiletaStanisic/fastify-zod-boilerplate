export const ErrorCodes = {
  NOT_FOUND: "NOT_FOUND",
  INVALID_BODY: "INVALID_BODY",
  INVALID_QUERY: "INVALID_QUERY",
  INVALID_REFERENCE: "INVALID_REFERENCE",
  INTERNAL: "INTERNAL_ERROR",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

export interface ApiError {
  error: ErrorCode;
  message: string;
  issues?: unknown;
}

export function notFound(resource: string): ApiError {
  return {
    error: ErrorCodes.NOT_FOUND,
    message: `${resource} not found`,
  };
}

export function invalidBody(issues: unknown): ApiError {
  return {
    error: ErrorCodes.INVALID_BODY,
    message: "Request body validation failed",
    issues,
  };
}

export function invalidQuery(issues: unknown): ApiError {
  return {
    error: ErrorCodes.INVALID_QUERY,
    message: "Query parameter validation failed",
    issues,
  };
}

export function invalidReference(field: string): ApiError {
  return {
    error: ErrorCodes.INVALID_REFERENCE,
    message: `Referenced ${field} does not exist`,
  };
}
