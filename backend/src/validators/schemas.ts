import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  timezone: z.string().optional().default('UTC'),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  timezone: z.string().optional(),
});

export const breakConfigSchema = z.object({
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  title: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
});

export const createDaySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  title: z.string().max(200).optional(),
  notes: z.string().optional(),
});

export const updateDaySchema = z.object({
  title: z.string().max(200).optional(),
  notes: z.string().optional(),
});

export const generateTimelineSchema = z.object({
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  mode: z.enum(['DURATION', 'SECTIONS', 'CUSTOM']),
  blockDuration: z.number().int().positive().optional(),
  numberOfSections: z.number().int().positive().optional(),
  breaks: z.array(breakConfigSchema).optional().default([]),
  replaceExisting: z.boolean().optional().default(true),
});

export const createBlockSchema = z.object({
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  type: z.enum(['JOURNAL', 'BREAK', 'CUSTOM']),
  title: z.string().max(200).optional(),
  content: z.string().optional(),
  mood: z.string().max(50).optional(),
  tags: z.array(z.string().max(50)).optional().default([]),
  completed: z.boolean().optional().default(false),
  orderIndex: z.number().int().min(0),
});

export const updateBlockSchema = z.object({
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  type: z.enum(['JOURNAL', 'BREAK', 'CUSTOM']).optional(),
  title: z.string().max(200).optional().nullable(),
  content: z.string().optional().nullable(),
  mood: z.string().max(50).optional().nullable(),
  tags: z.array(z.string().max(50)).optional(),
  completed: z.boolean().optional(),
});

export const createBreakSchema = breakConfigSchema.extend({
  title: z.string().max(100).optional().default('Break'),
  description: z.string().max(500).optional(),
});

export const createTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  mode: z.enum(['DURATION', 'SECTIONS', 'CUSTOM']),
  blockDuration: z.number().int().positive().optional(),
  numberOfSections: z.number().int().positive().optional(),
  breaks: z.array(breakConfigSchema).optional().default([]),
});

export const updateTemplateSchema = createTemplateSchema.partial();

export const applyTemplateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  replaceExisting: z.boolean().optional().default(false),
});

export const searchQuerySchema = z.object({
  q: z.string().min(1).max(200),
  limit: z.coerce.number().int().positive().max(50).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
});
