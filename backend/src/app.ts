import Fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fastifyCors from '@fastify/cors';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifyCookie from '@fastify/cookie';
import { errorHandler } from './middleware/errorHandler.js';
import { routes } from './routes/index.js';

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'test' ? 'silent' : 'info',
    },
  });

  // --- Plugins ---

  await app.register(fastifyCookie);

  await app.register(fastifyCors, {
    origin: (process.env.CORS_ORIGINS || 'http://localhost:5173').split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  await app.register(fastifyRateLimit, {
    global: true,
    max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
    timeWindow: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
  });

  await app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production-32chars!!',
    sign: {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },
  });

  // --- Error handler ---
  app.setErrorHandler(errorHandler);

  // --- Routes ---
  await app.register(routes);

  return app;
}
