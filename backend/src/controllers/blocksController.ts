import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../utils/prisma.js';
import { updateBlockSchema } from '../validators/schemas.js';
import { notFound, forbidden } from '../middleware/errorHandler.js';

async function requireBlockOwnership(blockId: string, userId: string) {
  const block = await prisma.timeBlock.findUnique({
    where: { id: blockId },
    include: { day: { select: { userId: true } } },
  });
  if (!block || block.day.userId !== userId) throw notFound('Block');
  return block;
}

// PUT /api/blocks/:id
export async function updateBlock(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const userId = request.user.id;
  const { id } = request.params;
  const body = updateBlockSchema.parse(request.body);

  await requireBlockOwnership(id, userId);

  const block = await prisma.timeBlock.update({
    where: { id },
    data: {
      ...(body.startTime !== undefined && { startTime: body.startTime }),
      ...(body.endTime !== undefined && { endTime: body.endTime }),
      ...(body.type !== undefined && { type: body.type }),
      ...(body.title !== undefined && { title: body.title }),
      ...(body.content !== undefined && { content: body.content }),
      ...(body.mood !== undefined && { mood: body.mood }),
      ...(body.tags !== undefined && { tags: Array.isArray(body.tags) ? body.tags.join(',') : body.tags }),
      ...(body.completed !== undefined && { completed: body.completed }),
    },
  });

  return reply.send({
    block: {
      ...block,
      tags: block.tags ? block.tags.split(',').filter(Boolean) : [],
    },
  });
}

// DELETE /api/blocks/:id
export async function deleteBlock(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const userId = request.user.id;
  const { id } = request.params;

  await requireBlockOwnership(id, userId);
  await prisma.timeBlock.delete({ where: { id } });
  return reply.status(204).send();
}
