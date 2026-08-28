export type BlockType = 'JOURNAL' | 'BREAK' | 'CUSTOM';
export type ConfigMode = 'DURATION' | 'SECTIONS' | 'CUSTOM';

export interface User {
  id: string;
  name: string;
  email: string;
  timezone: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BreakConfig {
  startTime: string;
  endTime: string;
  title?: string;
  description?: string;
}

export interface DayConfiguration {
  id: string;
  dayId: string;
  startTime: string;
  endTime: string;
  defaultBlockDuration?: number | null;
  numberOfSections?: number | null;
  mode: ConfigMode;
  breaks: BreakConfig[];
  createdAt: string;
  updatedAt: string;
}

export interface TimeBlock {
  id: string;
  dayId: string;
  startTime: string;
  endTime: string;
  type: BlockType;
  title?: string | null;
  content?: string | null;
  mood?: string | null;
  tags: string[];
  completed: boolean;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface Day {
  id: string;
  userId: string;
  date: string;
  title?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  configuration?: DayConfiguration | null;
  blocks: TimeBlock[];
  _count?: { blocks: number };
}

export interface Template {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  startTime: string;
  endTime: string;
  defaultBlockDuration?: number | null;
  numberOfSections?: number | null;
  mode: ConfigMode;
  breaks: BreakConfig[];
  createdAt: string;
  updatedAt: string;
}

export interface Statistics {
  totalDays: number;
  totalJournalBlocks: number;
  completedBlocks: number;
  completionRate: number;
  totalBreaks: number;
  streak: number;
  mostActiveHour: number | null;
  activityByHour: Array<{ hour: number; count: number }>;
}

export interface SearchResult {
  blockId: string;
  dayId: string;
  date: string;
  dayTitle?: string | null;
  startTime: string;
  endTime: string;
  type: BlockType;
  title?: string | null;
  contentPreview?: string | null;
  tags: string[];
  completed: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  statusCode: number;
  code: string;
  message: string;
  details?: unknown;
}
