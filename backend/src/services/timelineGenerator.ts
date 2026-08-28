export interface BreakConfig {
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  title?: string;
  description?: string;
}

export interface GenerateTimelineInput {
  dayStart: string;        // "HH:MM"
  dayEnd: string;          // "HH:MM"
  mode: 'DURATION' | 'SECTIONS' | 'CUSTOM';
  blockDuration?: number;  // minutes (mode = DURATION)
  numberOfSections?: number; // (mode = SECTIONS)
  breaks?: BreakConfig[];
}

export interface GeneratedBlock {
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  type: 'JOURNAL' | 'BREAK';
  title?: string;
  description?: string;
  orderIndex: number;
}

export interface TimelineGenerationResult {
  blocks: GeneratedBlock[];
  warnings: string[];
}

export class TimelineGenerationError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = 'TimelineGenerationError';
  }
}

// --- Utility helpers ---

/** Convert "HH:MM" to total minutes since midnight */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/** Convert total minutes since midnight to "HH:MM" */
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Validate "HH:MM" format */
function isValidTimeFormat(t: string): boolean {
  return /^\d{2}:\d{2}$/.test(t);
}

// --- Core algorithm ---

export function generateTimeline(input: GenerateTimelineInput): TimelineGenerationResult {
  const { dayStart, dayEnd, mode, blockDuration, numberOfSections, breaks = [] } = input;
  const warnings: string[] = [];

  // 1. Validate time format
  if (!isValidTimeFormat(dayStart) || !isValidTimeFormat(dayEnd)) {
    throw new TimelineGenerationError('Invalid time format. Use HH:MM.', 'INVALID_TIME_FORMAT');
  }

  const dayStartMin = timeToMinutes(dayStart);
  const dayEndMin = timeToMinutes(dayEnd);

  // 2. Validate day range
  if (dayEndMin <= dayStartMin) {
    throw new TimelineGenerationError(
      'Day end time must be after start time.',
      'INVALID_DAY_RANGE'
    );
  }

  const dayDurationMin = dayEndMin - dayStartMin;

  // 3. Validate mode-specific params
  if (mode === 'DURATION') {
    if (!blockDuration || blockDuration <= 0) {
      throw new TimelineGenerationError(
        'Block duration must be a positive number.',
        'INVALID_BLOCK_DURATION'
      );
    }
    if (blockDuration > dayDurationMin) {
      throw new TimelineGenerationError(
        'Block duration exceeds total day duration.',
        'BLOCK_DURATION_TOO_LARGE'
      );
    }
  }

  if (mode === 'SECTIONS') {
    if (!numberOfSections || numberOfSections <= 0) {
      throw new TimelineGenerationError(
        'Number of sections must be a positive integer.',
        'INVALID_SECTIONS'
      );
    }
  }

  // 4. Validate and normalize breaks
  for (const brk of breaks) {
    if (!isValidTimeFormat(brk.startTime) || !isValidTimeFormat(brk.endTime)) {
      throw new TimelineGenerationError(
        `Invalid break time format: ${brk.startTime} - ${brk.endTime}`,
        'INVALID_BREAK_TIME_FORMAT'
      );
    }

    const bStart = timeToMinutes(brk.startTime);
    const bEnd = timeToMinutes(brk.endTime);

    if (bEnd <= bStart) {
      throw new TimelineGenerationError(
        `Break end must be after start: ${brk.startTime} - ${brk.endTime}`,
        'INVALID_BREAK_RANGE'
      );
    }
    if (bStart < dayStartMin || bEnd > dayEndMin) {
      throw new TimelineGenerationError(
        `Break ${brk.startTime} - ${brk.endTime} is outside the day (${dayStart} - ${dayEnd}).`,
        'BREAK_OUTSIDE_DAY'
      );
    }
  }

  // 5. Sort breaks by start time
  const sortedBreaks = [...breaks].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );

  // 6. Validate breaks don't overlap each other
  for (let i = 0; i < sortedBreaks.length - 1; i++) {
    const current = sortedBreaks[i];
    const next = sortedBreaks[i + 1];
    if (timeToMinutes(current.endTime) > timeToMinutes(next.startTime)) {
      throw new TimelineGenerationError(
        `Breaks overlap: ${current.startTime}-${current.endTime} and ${next.startTime}-${next.endTime}`,
        'OVERLAPPING_BREAKS'
      );
    }
  }

  // 7. Build list of available (non-break) intervals
  // Compute intervals between breaks within [dayStart, dayEnd]
  const availableIntervals: Array<{ start: number; end: number }> = [];
  let cursor = dayStartMin;

  for (const brk of sortedBreaks) {
    const bStart = timeToMinutes(brk.startTime);
    const bEnd = timeToMinutes(brk.endTime);

    if (bStart > cursor) {
      availableIntervals.push({ start: cursor, end: bStart });
    }
    cursor = bEnd;
  }

  // Remaining interval after the last break
  if (cursor < dayEndMin) {
    availableIntervals.push({ start: cursor, end: dayEndMin });
  }

  // 8. Calculate block duration for SECTIONS mode
  let effectiveBlockDuration = blockDuration ?? 0;

  if (mode === 'SECTIONS') {
    const totalAvailableMinutes = availableIntervals.reduce(
      (sum, iv) => sum + (iv.end - iv.start),
      0
    );
    if (numberOfSections! > 0) {
      effectiveBlockDuration = totalAvailableMinutes / numberOfSections!;
    }
  }

  // 9. Generate journal blocks for each available interval
  const blocks: GeneratedBlock[] = [];
  let orderIndex = 0;

  function insertBreakAt(brk: BreakConfig): void {
    blocks.push({
      startTime: brk.startTime,
      endTime: brk.endTime,
      type: 'BREAK',
      title: brk.title || 'Break',
      description: brk.description,
      orderIndex: orderIndex++,
    });
  }

  // Interleave available intervals with breaks in order
  let breakIdx = 0;
  let intervalIdx = 0;

  // We walk through time using sorted breaks and available intervals together
  const allSegments: Array<
    | { kind: 'interval'; start: number; end: number }
    | { kind: 'break'; brk: BreakConfig }
  > = [];

  cursor = dayStartMin;
  for (const brk of sortedBreaks) {
    const bStart = timeToMinutes(brk.startTime);
    if (bStart > cursor) {
      allSegments.push({ kind: 'interval', start: cursor, end: bStart });
    }
    allSegments.push({ kind: 'break', brk });
    cursor = timeToMinutes(brk.endTime);
  }
  if (cursor < dayEndMin) {
    allSegments.push({ kind: 'interval', start: cursor, end: dayEndMin });
  }

  for (const segment of allSegments) {
    if (segment.kind === 'break') {
      insertBreakAt(segment.brk);
    } else {
      // Divide this interval into journal blocks
      const { start, end } = segment;
      const intervalDuration = end - start;

      if (mode === 'CUSTOM') {
        // In custom mode, just add one block for the full interval
        blocks.push({
          startTime: minutesToTime(start),
          endTime: minutesToTime(end),
          type: 'JOURNAL',
          orderIndex: orderIndex++,
        });
      } else {
        // DURATION or SECTIONS
        let blockStart = start;
        while (blockStart < end) {
          const blockEnd = Math.min(blockStart + effectiveBlockDuration, end);
          blocks.push({
            startTime: minutesToTime(blockStart),
            endTime: minutesToTime(blockEnd),
            type: 'JOURNAL',
            orderIndex: orderIndex++,
          });
          if (blockEnd >= end) break;
          blockStart = blockEnd;
        }
      }
    }
  }

  // 10. Validation: ensure no overlapping blocks (safety check)
  for (let i = 0; i < blocks.length - 1; i++) {
    const a = blocks[i];
    const b = blocks[i + 1];
    if (timeToMinutes(a.endTime) > timeToMinutes(b.startTime)) {
      warnings.push(`Warning: blocks may overlap at ${a.endTime}/${b.startTime}`);
    }
  }

  return { blocks, warnings };
}
