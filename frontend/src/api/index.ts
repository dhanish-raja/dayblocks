import api from './client';
import type {
  AuthResponse, User, Day, TimeBlock, Template, Statistics, SearchResult, BreakConfig, ConfigMode,
} from '@/types';

// --- Auth ---
export const authApi = {
  register: (data: { name: string; email: string; password: string; timezone?: string }) =>
    api.post<AuthResponse>('/auth/register', data).then(r => r.data),

  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data).then(r => r.data),

  logout: () => api.post('/auth/logout').then(r => r.data),

  me: () => api.get<{ user: User }>('/auth/me').then(r => r.data.user),
};

// --- Days ---
export const daysApi = {
  list: () => api.get<{ days: Day[] }>('/days').then(r => r.data.days),

  get: (date: string) => api.get<{ day: Day }>(`/days/${date}`).then(r => r.data.day),

  create: (data: { date: string; title?: string; notes?: string }) =>
    api.post<{ day: Day }>('/days', data).then(r => r.data.day),

  update: (date: string, data: { title?: string; notes?: string }) =>
    api.put<{ day: Day }>(`/days/${date}`, data).then(r => r.data.day),

  delete: (date: string) => api.delete(`/days/${date}`),

  generate: (
    date: string,
    data: {
      startTime: string;
      endTime: string;
      mode: ConfigMode;
      blockDuration?: number;
      numberOfSections?: number;
      breaks?: BreakConfig[];
      replaceExisting?: boolean;
    }
  ) =>
    api.post<{ day: Day; warnings: string[] }>(`/days/${date}/generate`, data).then(r => r.data),

  getBlocks: (date: string) =>
    api.get<{ blocks: TimeBlock[] }>(`/days/${date}/blocks`).then(r => r.data.blocks),

  createBlock: (date: string, data: Partial<TimeBlock>) =>
    api.post<{ block: TimeBlock }>(`/days/${date}/blocks`, data).then(r => r.data.block),
};

// --- Blocks ---
export const blocksApi = {
  update: (id: string, data: Partial<TimeBlock>) =>
    api.put<{ block: TimeBlock }>(`/blocks/${id}`, data).then(r => r.data.block),

  delete: (id: string) => api.delete(`/blocks/${id}`),
};

// --- Search ---
export const searchApi = {
  search: (q: string, limit = 20, offset = 0) =>
    api
      .get<{ results: SearchResult[]; total: number; offset: number }>('/search', {
        params: { q, limit, offset },
      })
      .then(r => r.data),
};

// --- Templates ---
export const templatesApi = {
  list: () => api.get<{ templates: Template[] }>('/templates').then(r => r.data.templates),

  create: (data: Omit<Template, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) =>
    api.post<{ template: Template }>('/templates', data).then(r => r.data.template),

  update: (id: string, data: Partial<Template>) =>
    api.put<{ template: Template }>(`/templates/${id}`, data).then(r => r.data.template),

  delete: (id: string) => api.delete(`/templates/${id}`),

  apply: (id: string, data: { date: string; replaceExisting?: boolean }) =>
    api.post<{ day: Day; warnings: string[] }>(`/templates/${id}/apply`, data).then(r => r.data),
};

// --- Statistics ---
export const statisticsApi = {
  get: () => api.get<{ statistics: Statistics }>('/statistics').then(r => r.data.statistics),
};
