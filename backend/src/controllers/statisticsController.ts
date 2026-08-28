import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../utils/prisma.js';

// GET /api/statistics
export async function getStatistics(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.user.id;

  // Total days
  const totalDays = await prisma.day.count({ where: { userId } });

  // Total journal blocks
  const totalJournalBlocks = await prisma.timeBlock.count({
    where: { day: { userId }, type: 'JOURNAL' },
  });

  // Completed blocks
  const completedBlocks = await prisma.timeBlock.count({
    where: { day: { userId }, type: 'JOURNAL', completed: true },
  });

  // Completion percentage
  const completionRate =
    totalJournalBlocks > 0
      ? Math.round((completedBlocks / totalJournalBlocks) * 100)
      : 0;

  // Total breaks
  const totalBreaks = await prisma.timeBlock.count({
    where: { day: { userId }, type: 'BREAK' },
  });

  // Most active time of day (hour buckets)
  const blocks = await prisma.timeBlock.findMany({
    where: { day: { userId }, type: 'JOURNAL' },
    select: { startTime: true, completed: true },
  });

  const hourCounts: Record<number, number> = {};
  for (const block of blocks) {
    const hour = parseInt(block.startTime.split(':')[0], 10);
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  }

  const mostActiveHour =
    Object.entries(hourCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? null;

  // Journaling streak (consecutive days with entries)
  const days = await prisma.day.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    select: { date: true },
  });

  let streak = 0;
  if (days.length > 0) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    let expected = new Date(today);
    for (const day of days) {
      const d = new Date(day.date);
      d.setUTCHours(0, 0, 0, 0);

      const diff = Math.round((expected.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
      if (diff <= 1) {
        streak++;
        expected = d;
      } else {
        break;
      }
    }
  }

  // Days with entries per week (last 8 weeks) for chart
  const eightWeeksAgo = new Date();
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

  const recentDays = await prisma.day.findMany({
    where: { userId, date: { gte: eightWeeksAgo } },
    select: { date: true, blocks: { select: { completed: true, type: true } } },
  });

  const activityByHour = Object.entries(hourCounts)
    .map(([hour, count]) => ({ hour: parseInt(hour), count }))
    .sort((a, b) => a.hour - b.hour);

  return reply.send({
    statistics: {
      totalDays,
      totalJournalBlocks,
      completedBlocks,
      completionRate,
      totalBreaks,
      streak,
      mostActiveHour: mostActiveHour ? parseInt(mostActiveHour) : null,
      activityByHour,
    },
  });
}
