import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { ZodError } from 'zod';

export interface AppError {
  statusCode: number;
  code: string;
  message: string;
  details?: unknown;
}

export class HttpError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export const notFound = (resource = 'Resource') =>
  new HttpError(404, 'NOT_FOUND', `${resource} not found.`);

export const unauthorized = (message = 'Unauthorized.') =>
  new HttpError(401, 'UNAUTHORIZED', message);

export const forbidden = (message = 'Access denied.') =>
  new HttpError(403, 'FORBIDDEN', message);

export const conflict = (message: string) =>
  new HttpError(409, 'CONFLICT', message);

export const badRequest = (message: string, details?: unknown) =>
  new HttpError(400, 'BAD_REQUEST', message, details);

export function errorHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply
) {
  request.log.error(error);

  if (error instanceof ZodError) {
    return reply.status(400).send({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Validation failed.',
      details: error.flatten().fieldErrors,
    });
  }

  if (error instanceof HttpError) {
    return reply.status(error.statusCode).send({
      statusCode: error.statusCode,
      code: error.code,
      message: error.message,
      details: error.details,
    });
  }

  // Fastify validation errors
  if ('validation' in error && error.validation) {
    return reply.status(400).send({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: error.message,
    });
  }

  // Prisma unique constraint violation
  if ('code' in error && error.code === 'P2002') {
    return reply.status(409).send({
      statusCode: 409,
      code: 'CONFLICT',
      message: 'A record with this data already exists.',
    });
  }

  // Default 500
  return reply.status(500).send({
    statusCode: 500,
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred.',
  });
}
