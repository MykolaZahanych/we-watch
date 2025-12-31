import { Response } from 'express';

/**
 * Standard API error response format
 */
interface ApiErrorResponse {
  error: string;
}

/**
 * Send a standardized error response
 * @param res Express response object
 * @param status HTTP status code
 * @param message Error message
 */
export function sendErrorResponse(
  res: Response,
  status: number,
  message: string
): Response {
  const errorResponse: ApiErrorResponse = {
    error: message,
  };
  return res.status(status).json(errorResponse);
}

export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

