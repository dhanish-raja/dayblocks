import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../utils/prisma.js';
import { searchQuerySchema } from '../validators/schemas.js';

// GET /api/search?q=...
export async function search(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.user.id;
  const query = searchQuerySchema.parse(request.query);

  const q = query.q.toLowerCase();

  const blocks = await prisma.timeBlock.findMany({
    where: {
      day: { userId },
      type: { not: 'BREAK' },
      OR: [
        { title: { contains: query.q } },
        { content: { contains: query.q } },
        { tags: { contains: query.q } },
      ],
    },
    include: {
      day: {
        select: { id: true, date: true, title: true },
      },
    },
    orderBy: [{ day: { date: 'desc' } }, { orderIndex: 'asc' }],
    take: query.limit,
    skip: query.offset,
  });

  const results = blocks.map((block) => ({
    blockId: block.id,
    dayId: block.day.id,
    date: block.day.date,
    dayTitle: block.day.title,
    startTime: block.startTime,
    endTime: block.endTime,
    type: block.type,
    title: block.title,
    contentPreview: block.content
      ? block.content.replace(/<[^>]*>/g, '').slice(0, 200)
      : null,
    tags: block.tags ? block.tags.split(',').filter(Boolean) : [],
    completed: block.completed,
  }));

  return reply.send({ results, total: results.length, offset: query.offset });
}
