import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../utils/prisma.js';
import {
  createTemplateSchema,
  updateTemplateSchema,
  applyTemplateSchema,
} from '../validators/schemas.js';
import { notFound, conflict } from '../middleware/errorHandler.js';
import { generateTimeline } from '../services/timelineGenerator.js';
import { BlockType, ConfigMode } from '@prisma/client';

async function requireTemplateOwnership(templateId: string, userId: string) {
  const template = await prisma.template.findUnique({ where: { id: templateId } });
  if (!template || template.userId !== userId) throw notFound('Template');
  return template;
}

// GET /api/templates
export async function listTemplates(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.user.id;
  const templates = await prisma.template.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  const formatted = templates.map((t) => ({
    ...t,
    breaks: JSON.parse(t.breaks || '[]'),
  }));

  return reply.send({ templates: formatted });
}

// POST /api/templates
export async function createTemplate(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.user.id;
  const body = createTemplateSchema.parse(request.body);

  const existing = await prisma.template.findUnique({
    where: { userId_name: { userId, name: body.name } },
  });
  if (existing) throw conflict('A template with this name already exists.');

  const template = await prisma.template.create({
    data: {
      userId,
      name: body.name,
      description: body.description,
      startTime: body.startTime,
      endTime: body.endTime,
      mode: body.mode,
      defaultBlockDuration: body.blockDuration,
      numberOfSections: body.numberOfSections,
      breaks: JSON.stringify(body.breaks || []),
    },
  });

  return reply.status(201).send({ template });
}

// PUT /api/templates/:id
export async function updateTemplate(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const userId = request.user.id;
  const { id } = request.params;
  const body = updateTemplateSchema.parse(request.body);

  await requireTemplateOwnership(id, userId);

  const template = await prisma.template.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.startTime !== undefined && { startTime: body.startTime }),
      ...(body.endTime !== undefined && { endTime: body.endTime }),
      ...(body.mode !== undefined && { mode: body.mode as ConfigMode }),
      ...(body.blockDuration !== undefined && { defaultBlockDuration: body.blockDuration }),
      ...(body.numberOfSections !== undefined && { numberOfSections: body.numberOfSections }),
      ...(body.breaks !== undefined && { breaks: body.breaks as any }),
    },
  });

  return reply.send({ template });
}

// DELETE /api/templates/:id
export async function deleteTemplate(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const userId = request.user.id;
  const { id } = request.params;

  await requireTemplateOwnership(id, userId);
  await prisma.template.delete({ where: { id } });
  return reply.status(204).send();
}

// POST /api/templates/:id/apply
export async function applyTemplate(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const userId = request.user.id;
  const { id } = request.params;
  const body = applyTemplateSchema.parse(request.body);

  const template = await requireTemplateOwnership(id, userId);

  const date = new Date(body.date + 'T00:00:00.000Z');

  // Check for existing day
  let day = await prisma.day.findUnique({
    where: { userId_date: { userId, date } },
  });

  if (!day) {
    day = await prisma.day.create({ data: { userId, date } });
  } else if (!body.replaceExisting) {
    throw conflict('A diary entry already exists for this date. Use replaceExisting: true to overwrite.');
  }

  const breaks = JSON.parse(template.breaks || '[]');

  // Run timeline generation
  const result = generateTimeline({
    dayStart: template.startTime,
    dayEnd: template.endTime,
    mode: template.mode as 'DURATION' | 'SECTIONS' | 'CUSTOM',
    blockDuration: template.defaultBlockDuration ?? undefined,
    numberOfSections: template.numberOfSections ?? undefined,
    breaks,
  });

  const updatedDay = await prisma.$transaction(async (tx) => {
    await tx.timeBlock.deleteMany({ where: { dayId: day!.id } });
    await tx.dayConfiguration.deleteMany({ where: { dayId: day!.id } });

    await tx.dayConfiguration.create({
      data: {
        dayId: day!.id,
        startTime: template.startTime,
        endTime: template.endTime,
        defaultBlockDuration: template.defaultBlockDuration,
        numberOfSections: template.numberOfSections,
        mode: template.mode,
        breaks: template.breaks,
      },
    });

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
