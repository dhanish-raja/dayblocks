import { describe, it, expect } from 'vitest';
import {
  generateTimeline,
  timeToMinutes,
  minutesToTime,
  TimelineGenerationError,
} from '../../src/services/timelineGenerator.js';

// Helper
const blockTimes = (blocks: Array<{ startTime: string; endTime: string }>) =>
  blocks.map((b) => `${b.startTime}-${b.endTime}`);

describe('timeToMinutes / minutesToTime', () => {
  it('converts 09:00 to 540', () => expect(timeToMinutes('09:00')).toBe(540));
  it('converts 13:15 to 795', () => expect(timeToMinutes('13:15')).toBe(795));
  it('converts 540 to 09:00', () => expect(minutesToTime(540)).toBe('09:00'));
  it('converts 795 to 13:15', () => expect(minutesToTime(795)).toBe('13:15'));
});

describe('generateTimeline', () => {
  // Test 1: 9 AM → 3 PM, 30-minute blocks, no breaks
  it('generates blocks with no breaks (30-min)', () => {
    const result = generateTimeline({
      dayStart: '09:00',
      dayEnd: '15:00',
      mode: 'DURATION',
      blockDuration: 30,
      breaks: [],
    });
    expect(result.blocks.length).toBe(12);
    expect(result.blocks[0]).toMatchObject({ startTime: '09:00', endTime: '09:30', type: 'JOURNAL' });
    expect(result.blocks[11]).toMatchObject({ startTime: '14:30', endTime: '15:00', type: 'JOURNAL' });
    // No break blocks
    expect(result.blocks.every((b) => b.type === 'JOURNAL')).toBe(true);
  });

  // Test 2: 9 AM → 3 PM, 30-minute blocks, 12:30 → 1:15 break
  it('generates blocks with one break (30-min, 12:30-13:15 break)', () => {
    const result = generateTimeline({
      dayStart: '09:00',
      dayEnd: '15:00',
      mode: 'DURATION',
      blockDuration: 30,
      breaks: [{ startTime: '12:30', endTime: '13:15', title: 'Lunch' }],
    });

    const journalBlocks = result.blocks.filter((b) => b.type === 'JOURNAL');
    const breakBlocks = result.blocks.filter((b) => b.type === 'BREAK');

    expect(breakBlocks.length).toBe(1);
    expect(breakBlocks[0]).toMatchObject({
      startTime: '12:30',
      endTime: '13:15',
      type: 'BREAK',
      title: 'Lunch',
    });

    // 9:00 → 12:30 = 210 min / 30 = 7 blocks
    // 13:15 → 15:00 = 105 min => 30+30+30+15 = 4 blocks
    expect(journalBlocks.length).toBe(11);

    // Check chronological order
    for (let i = 0; i < result.blocks.length - 1; i++) {
      expect(timeToMinutes(result.blocks[i].endTime)).toBeLessThanOrEqual(
        timeToMinutes(result.blocks[i + 1].startTime)
      );
    }
  });

  // Test 3: Multiple breaks
  it('handles multiple breaks correctly', () => {
    const result = generateTimeline({
      dayStart: '09:00',
      dayEnd: '17:00',
      mode: 'DURATION',
      blockDuration: 60,
      breaks: [
        { startTime: '11:00', endTime: '11:15', title: 'Coffee' },
        { startTime: '13:00', endTime: '14:00', title: 'Lunch' },
      ],
    });

    const breaks = result.blocks.filter((b) => b.type === 'BREAK');
    expect(breaks.length).toBe(2);
    expect(breaks[0].title).toBe('Coffee');
    expect(breaks[1].title).toBe('Lunch');

    // All blocks in chronological order
    for (let i = 0; i < result.blocks.length - 1; i++) {
      expect(timeToMinutes(result.blocks[i].endTime)).toBeLessThanOrEqual(
        timeToMinutes(result.blocks[i + 1].startTime)
      );
    }
  });

  // Test 4: Break at the beginning
  it('handles break at the beginning of the day', () => {
    const result = generateTimeline({
      dayStart: '09:00',
      dayEnd: '17:00',
      mode: 'DURATION',
      blockDuration: 60,
      breaks: [{ startTime: '09:00', endTime: '09:30', title: 'Morning standup' }],
    });

    expect(result.blocks[0]).toMatchObject({ type: 'BREAK', startTime: '09:00', endTime: '09:30' });
    expect(result.blocks[1]).toMatchObject({ type: 'JOURNAL', startTime: '09:30' });
  });

  // Test 5: Break at the end
  it('handles break at the end of the day', () => {
    const result = generateTimeline({
      dayStart: '09:00',
      dayEnd: '17:00',
      mode: 'DURATION',
      blockDuration: 60,
      breaks: [{ startTime: '16:00', endTime: '17:00', title: 'Wind down' }],
    });

    const lastBlock = result.blocks[result.blocks.length - 1];
    expect(lastBlock).toMatchObject({ type: 'BREAK', startTime: '16:00', endTime: '17:00' });
  });

  // Test 6: Break with arbitrary duration (45 minutes)
  it('preserves arbitrary break duration', () => {
    const result = generateTimeline({
      dayStart: '09:00',
      dayEnd: '17:00',
      mode: 'DURATION',
      blockDuration: 30,
      breaks: [{ startTime: '12:15', endTime: '13:00', title: 'Lunch' }],
    });

    const breakBlock = result.blocks.find((b) => b.type === 'BREAK');
    expect(breakBlock).toBeDefined();
    expect(breakBlock!.startTime).toBe('12:15');
    expect(breakBlock!.endTime).toBe('13:00');
    // Duration = 45 min (arbitrary, not aligned to 30-min blocks)
    expect(timeToMinutes(breakBlock!.endTime) - timeToMinutes(breakBlock!.startTime)).toBe(45);
  });

  // Test 7: Final block shorter than configured duration
  it('preserves final partial block', () => {
    // 09:00 → 10:10, 30-min blocks → [09:00-09:30, 09:30-10:00, 10:00-10:10]
    const result = generateTimeline({
      dayStart: '09:00',
      dayEnd: '10:10',
      mode: 'DURATION',
      blockDuration: 30,
      breaks: [],
    });

    expect(result.blocks.length).toBe(3);
    expect(result.blocks[2]).toMatchObject({ startTime: '10:00', endTime: '10:10', type: 'JOURNAL' });
  });

  // Test 8: Number-of-sections mode
  it('divides day into equal sections (SECTIONS mode)', () => {
    // 09:00 → 15:00 = 360 min, 12 sections = 30 min each
    const result = generateTimeline({
      dayStart: '09:00',
      dayEnd: '15:00',
      mode: 'SECTIONS',
      numberOfSections: 12,
      breaks: [],
    });

    expect(result.blocks.length).toBe(12);
    result.blocks.forEach((b) => {
      expect(timeToMinutes(b.endTime) - timeToMinutes(b.startTime)).toBeCloseTo(30, 0);
    });
  });

  // Test 9: Invalid overlapping breaks → throws
  it('throws on overlapping breaks', () => {
    expect(() =>
      generateTimeline({
        dayStart: '09:00',
        dayEnd: '17:00',
        mode: 'DURATION',
        blockDuration: 30,
        breaks: [
          { startTime: '12:00', endTime: '13:00' },
          { startTime: '12:30', endTime: '13:30' },
        ],
      })
    ).toThrow(TimelineGenerationError);
  });

  // Test 10: Invalid day boundaries
  it('throws when end is before start', () => {
    expect(() =>
      generateTimeline({
        dayStart: '15:00',
        dayEnd: '09:00',
        mode: 'DURATION',
        blockDuration: 30,
      })
    ).toThrow(TimelineGenerationError);
  });

  it('throws when break is outside day', () => {
    expect(() =>
      generateTimeline({
        dayStart: '09:00',
        dayEnd: '15:00',
        mode: 'DURATION',
        blockDuration: 30,
        breaks: [{ startTime: '08:00', endTime: '09:00' }],
      })
    ).toThrow(TimelineGenerationError);
  });

  it('throws when break end exceeds day end', () => {
    expect(() =>
      generateTimeline({
        dayStart: '09:00',
        dayEnd: '15:00',
        mode: 'DURATION',
        blockDuration: 30,
        breaks: [{ startTime: '14:30', endTime: '15:30' }],
      })
    ).toThrow(TimelineGenerationError);
  });

  it('throws on invalid block duration', () => {
    expect(() =>
      generateTimeline({
        dayStart: '09:00',
        dayEnd: '15:00',
        mode: 'DURATION',
        blockDuration: 0,
      })
    ).toThrow(TimelineGenerationError);
  });

  it('produces blocks in chronological order (complex schedule)', () => {
    const result = generateTimeline({
      dayStart: '08:00',
      dayEnd: '18:00',
      mode: 'DURATION',
      blockDuration: 45,
      breaks: [
        { startTime: '10:00', endTime: '10:15', title: 'Coffee' },
        { startTime: '12:30', endTime: '13:30', title: 'Lunch' },
        { startTime: '15:30', endTime: '15:45', title: 'Break' },
      ],
    });

    for (let i = 0; i < result.blocks.length - 1; i++) {
      const curr = result.blocks[i];
      const next = result.blocks[i + 1];
      expect(timeToMinutes(curr.endTime)).toBeLessThanOrEqual(timeToMinutes(next.startTime));
    }
  });
});
