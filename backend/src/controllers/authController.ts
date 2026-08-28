import { FastifyRequest, FastifyReply } from 'fastify';
import argon2 from 'argon2';
import { prisma } from '../utils/prisma.js';
import { registerSchema, loginSchema } from '../validators/schemas.js';
import { conflict, unauthorized, badRequest } from '../middleware/errorHandler.js';

export async function register(request: FastifyRequest, reply: FastifyReply) {
  const body = registerSchema.parse(request.body);

  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) throw conflict('An account with this email already exists.');

  const passwordHash = await argon2.hash(body.password);

  const user = await prisma.user.create({
    data: {
      name: body.name,
      email: body.email,
      passwordHash,
      timezone: body.timezone,
    },
    select: { id: true, name: true, email: true, timezone: true, createdAt: true },
  });

  const token = await reply.jwtSign({ id: user.id, email: user.email });

  return reply.status(201).send({ user, token });
}

export async function login(request: FastifyRequest, reply: FastifyReply) {
  const body = loginSchema.parse(request.body);

  const user = await prisma.user.findUnique({ where: { email: body.email } });
  if (!user) throw unauthorized('Invalid email or password.');

  const valid = await argon2.verify(user.passwordHash, body.password);
  if (!valid) throw unauthorized('Invalid email or password.');

  const token = await reply.jwtSign({ id: user.id, email: user.email });

  return reply.send({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      timezone: user.timezone,
      createdAt: user.createdAt,
    },
    token,
  });
}

export async function logout(_request: FastifyRequest, reply: FastifyReply) {
  // JWT is stateless; client drops token. Return 200.
  return reply.send({ message: 'Logged out successfully.' });
}

export async function me(request: FastifyRequest, reply: FastifyReply) {
  const user = await prisma.user.findUnique({
    where: { id: request.user.id },
    select: { id: true, name: true, email: true, timezone: true, createdAt: true, updatedAt: true },
  });
  if (!user) throw unauthorized();
  return reply.send({ user });
}
