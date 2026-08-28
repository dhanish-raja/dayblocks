import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../utils/prisma.js';
import {
  createDaySchema,
  updateDaySchema,
  generateTimelineSchema,
  createBlockSchema,
} from '../validators/schemas.js';
import { notFound, badRequest, conflict } from '../middleware/errorHandler.js';
import { generateTimeline } from '../services/timelineGenerator.js';
import { BlockType, ConfigMode } from '@prisma/client';

function parseDateParam(dateStr: string): Date {
  const d = new Date(dateStr + 'T00:00:00.000Z');
  if (isNaN(d.getTime())) throw badRequest('Invalid date format. Use YYYY-MM-DD.');
  return d;
}

async function requireDayOwnership(dayId: string, userId: string) {
  const day = await prisma.day.findUnique({ where: { id: dayId } });
  if (!day) throw notFound('Day');
  if (day.userId !== userId) throw notFound('Day'); // 404 not 403 (don't leak existence)
  return day;
}

// GET /api/days
export async function listDays(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.user.id;
  const days = await prisma.day.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    include: {
      configuration: true,
      _count: { select: { blocks: true } },
    },
  });
  return reply.send({ days });
}

// GET /api/days/:date
export async function getDay(
  request: FastifyRequest<{ Params: { date: string } }>,
  reply: FastifyReply
) {
  const userId = request.user.id;
  const date = parseDateParam(request.params.date);

  const day = await prisma.day.findUnique({
    where: { userId_date: { userId, date } },
    include: {
      configuration: true,
      blocks: { orderBy: { orderIndex: 'asc' } },
    },
  });

  if (!day) throw notFound('Day');

  const formattedDay = {
    ...day,
    configuration: day.configuration
      ? {
          ...day.configuration,
          breaks: JSON.parse(day.configuration.breaks || '[]'),
        }
      : null,
    blocks: day.blocks.map((b) => ({
      ...b,
      tags: b.tags ? b.tags.split(',').filter(Boolean) : [],
    })),
  };

  return reply.send({ day: formattedDay });
}

// POST /api/days
export async function createDay(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.user.id;
  const body = createDaySchema.parse(request.body);
  const date = parseDateParam(body.date);

  const existing = await prisma.day.findUnique({
    where: { userId_date: { userId, date } },
  });
  if (existing) throw conflict('A diary entry already exists for this date.');

  const day = await prisma.day.create({
    data: {
      userId,
      date,
      title: body.title,
      notes: body.notes,
    },
    include: { configuration: true, blocks: true },
  });

  return reply.status(201).send({ day });
}

// PUT /api/days/:date
export async function updateDay(
  request: FastifyRequest<{ Params: { date: string } }>,
  reply: FastifyReply
) {
  const userId = request.user.id;
  const date = parseDateParam(request.params.date);
  const body = updateDaySchema.parse(request.body);

  const existing = await prisma.day.findUnique({
    where: { userId_date: { userId, date } },
  });
  if (!existing) throw notFound('Day');

  const day = await prisma.day.update({
    where: { id: existing.id },
    data: body,
    include: { configuration: true, blocks: { orderBy: { orderIndex: 'asc' } } },
  });

  return reply.send({ day });
}

// DELETE /api/days/:date
export async function deleteDay(
  request: FastifyRequest<{ Params: { date: string } }>,
  reply: FastifyReply
) {
  const userId = request.user.id;
  const date = parseDateParam(request.params.date);

  const existing = await prisma.day.findUnique({
    where: { userId_date: { userId, date } },
  });
  if (!existing) throw notFound('Day');

  await prisma.day.delete({ where: { id: existing.id } });
  return reply.status(204).send();
}

// POST /api/days/:date/generate
export async function generateDayTimeline(
  request: FastifyRequest<{ Params: { date: string } }>,
  reply: FastifyReply
) {
  const userId = request.user.id;
  const date = parseDateParam(request.params.date);
  const body = generateTimelineSchema.parse(request.body);

  // Get or create the day
  let day = await prisma.day.findUnique({
    where: { userId_date: { userId, date } },
  });

  if (!day) {
    day = await prisma.day.create({
      data: { userId, date },
    });
  }

  // Run timeline generation algorithm
  const result = generateTimeline({
    dayStart: body.startTime,
    dayEnd: body.endTime,
    mode: body.mode,
    blockDuration: body.blockDuration,
    numberOfSections: body.numberOfSections,
    breaks: body.breaks,
  });

  // Save to database in a transaction
  const updatedDay = await prisma.$transaction(async (tx) => {
    // Remove existing blocks if replaceExisting
    if (body.replaceExisting) {
      await tx.timeBlock.deleteMany({ where: { dayId: day!.id } });
      await tx.dayConfiguration.deleteMany({ where: { dayId: day!.id } });
    }

    // Save configuration
    await tx.dayConfiguration.create({
      data: {
        dayId: day!.id,
        startTime: body.startTime,
        endTime: body.endTime,
        defaultBlockDuration: body.blockDuration,
        numberOfSections: body.numberOfSections,
        mode: body.mode,
        breaks: JSON.stringify(body.breaks || []),
      },
    });

    // Save generated blocks
    await tx.timeBlock.createMany({
      data: result.blocks.map((block) => ({
        dayId: day!.id,
        startTime: block.startTime,
        endTime: block.endTime,
        type: block.type,
        title: block.title || null,
        content: null,
        orderIndex: block.orderIndex,
        tags: '',
        completed: false,
      })),
    });

    return tx.day.findUnique({
      where: { id: day!.id },
      include: {
        configuration: true,
        blocks: { orderBy: { orderIndex: 'asc' } },
      },
    });
  });

  return reply.send({ day: updatedDay, warnings: result.warnings });
}

// GET /api/days/:date/blocks
export async function getBlocks(
  request: FastifyRequest<{ Params: { date: string } }>,
  reply: FastifyReply
) {
  const userId = request.user.id;
  const date = parseDateParam(request.params.date);

  const day = await prisma.day.findUnique({
    where: { userId_date: { userId, date } },
  });
  if (!day) throw notFound('Day');

  const blocks = await prisma.timeBlock.findMany({
    where: { dayId: day.id },
    orderBy: { orderIndex: 'asc' },
  });

  return reply.send({ blocks });
}

// POST /api/days/:date/blocks
export async function createBlock(
  request: FastifyRequest<{ Params: { date: string } }>,
  reply: FastifyReply
) {
  const userId = request.user.id;
  const date = parseDateParam(request.params.date);
  const body = createBlockSchema.parse(request.body);

  let day = await prisma.day.findUnique({
    where: { userId_date: { userId, date } },
  });
  if (!day) throw notFound('Day');

  const block = await prisma.timeBlock.create({
    data: {
      dayId: day.id,
      startTime: body.startTime,
      endTime: body.endTime,
      type: body.type,
      title: body.title,
      content: body.content,
      mood: body.mood,
      tags: body.tags ? body.tags.join(',') : '',
      completed: body.completed,
      orderIndex: body.orderIndex,
    },
  });

  return reply.status(201).send({
    block: {
      ...block,
      tags: block.tags ? block.tags.split(',').filter(Boolean) : [],
    },
  });
}
