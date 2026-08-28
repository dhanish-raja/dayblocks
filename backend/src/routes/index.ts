import { FastifyInstance } from 'fastify';
import { authenticate } from '../middleware/auth.js';
import { register, login, logout, me } from '../controllers/authController.js';
import {
  listDays,
  getDay,
  createDay,
  updateDay,
  deleteDay,
  generateDayTimeline,
  getBlocks,
  createBlock,
} from '../controllers/daysController.js';
import { updateBlock, deleteBlock } from '../controllers/blocksController.js';
import { search } from '../controllers/searchController.js';
import {
  listTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  applyTemplate,
} from '../controllers/templatesController.js';
import { getStatistics } from '../controllers/statisticsController.js';

export async function routes(app: FastifyInstance) {
  // --- Auth (no auth required) ---
  app.post('/api/auth/register', register);
  app.post('/api/auth/login', login);

  // --- Auth (auth required) ---
  app.post('/api/auth/logout', { preHandler: [authenticate] }, logout);
  app.get('/api/auth/me', { preHandler: [authenticate] }, me);

  // --- Days ---
  app.get('/api/days', { preHandler: [authenticate] }, listDays);
  app.get('/api/days/:date', { preHandler: [authenticate] }, getDay);
  app.post('/api/days', { preHandler: [authenticate] }, createDay);
  app.put('/api/days/:date', { preHandler: [authenticate] }, updateDay);
  app.delete('/api/days/:date', { preHandler: [authenticate] }, deleteDay);

  // --- Timeline generation ---
  app.post('/api/days/:date/generate', { preHandler: [authenticate] }, generateDayTimeline);

  // --- Blocks ---
  app.get('/api/days/:date/blocks', { preHandler: [authenticate] }, getBlocks);
  app.post('/api/days/:date/blocks', { preHandler: [authenticate] }, createBlock);
  app.put('/api/blocks/:id', { preHandler: [authenticate] }, updateBlock);
  app.delete('/api/blocks/:id', { preHandler: [authenticate] }, deleteBlock);

  // --- Search ---
  app.get('/api/search', { preHandler: [authenticate] }, search);

  // --- Templates ---
  app.get('/api/templates', { preHandler: [authenticate] }, listTemplates);
  app.post('/api/templates', { preHandler: [authenticate] }, createTemplate);
  app.put('/api/templates/:id', { preHandler: [authenticate] }, updateTemplate);
  app.delete('/api/templates/:id', { preHandler: [authenticate] }, deleteTemplate);
  app.post('/api/templates/:id/apply', { preHandler: [authenticate] }, applyTemplate);

  // --- Statistics ---
  app.get('/api/statistics', { preHandler: [authenticate] }, getStatistics);

  // --- Health check ---
  app.get('/', async (_req, reply) =>
    reply.send({ name: 'DayBlocks API', status: 'ok', version: '1.0.0' })
  );
  app.get('/api/health', async (_req, reply) => reply.send({ status: 'ok' }));
}
