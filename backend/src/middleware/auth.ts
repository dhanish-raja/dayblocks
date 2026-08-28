import { FastifyRequest, FastifyReply } from 'fastify';
import { unauthorized } from './errorHandler.js';

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch {
    throw unauthorized('Invalid or missing authentication token.');
  }
}

// Augment FastifyRequest to include user type
declare module 'fastify' {
  interface FastifyRequest {
    user: {
      id: string;
      email: string;
    };
  }
}
