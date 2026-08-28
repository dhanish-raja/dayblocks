import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean up
  await prisma.timeBlock.deleteMany();
  await prisma.dayConfiguration.deleteMany();
  await prisma.day.deleteMany();
  await prisma.template.deleteMany();
  await prisma.user.deleteMany();

  // Create demo user
  const passwordHash = await argon2.hash('demo1234');
  const user = await prisma.user.create({
    data: {
      name: 'Alex Johnson',
      email: 'demo@dayblocks.app',
      passwordHash,
      timezone: 'America/New_York',
    },
  });

  console.log(`✅ Created user: ${user.email}`);

  // Helper to create a day with timeline
  async function createDay(
    dateStr: string,
    config: {
      startTime: string;
      endTime: string;
      mode: 'DURATION' | 'SECTIONS' | 'CUSTOM';
      blockDuration?: number;
      breaks?: Array<{ startTime: string; endTime: string; title: string }>;
    },
    entries: Array<{
      startTime: string;
      endTime: string;
      type: 'JOURNAL' | 'BREAK' | 'CUSTOM';
      title?: string;
      content?: string;
      completed?: boolean;
      tags?: string[];
      mood?: string;
    }>
  ) {
    const date = new Date(dateStr + 'T00:00:00.000Z');

    const day = await prisma.day.create({
      data: {
        userId: user.id,
        date,
        title: `${dateStr} journal`,
      },
    });

    await prisma.dayConfiguration.create({
      data: {
        dayId: day.id,
        startTime: config.startTime,
        endTime: config.endTime,
        defaultBlockDuration: config.blockDuration,
        mode: config.mode,
        breaks: JSON.stringify(config.breaks || []),
      },
    });

    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      await prisma.timeBlock.create({
        data: {
          dayId: day.id,
          startTime: e.startTime,
          endTime: e.endTime,
          type: e.type,
          title: e.title || null,
          content: e.content || null,
          completed: e.completed ?? false,
          tags: e.tags ? e.tags.join(',') : '',
          mood: e.mood || null,
          orderIndex: i,
        },
      });
    }

    console.log(`✅ Created day: ${dateStr} with ${entries.length} blocks`);
    return day;
  }

  // --- Day 1: August 27, 2026 ---
  await createDay(
    '2026-08-27',
    { startTime: '09:00', endTime: '17:00', mode: 'DURATION', blockDuration: 60, breaks: [
      { startTime: '13:00', endTime: '14:00', title: 'Lunch' }
    ] },
    [
      { startTime: '09:00', endTime: '10:00', type: 'JOURNAL', title: 'Morning planning', content: '<p>Started the day with a comprehensive review of the week\'s goals. Identified three key areas to focus on: project delivery, team communication, and learning time.</p>', completed: true, tags: ['planning', 'goals'], mood: 'great' },
      { startTime: '10:00', endTime: '11:00', type: 'JOURNAL', title: 'Deep work session', content: '<p>Focused on the authentication module. Made significant progress on the JWT implementation. The token refresh mechanism is working correctly now.</p>', completed: true, tags: ['coding', 'auth'], mood: 'good' },
      { startTime: '11:00', endTime: '12:00', type: 'JOURNAL', title: 'Code review', content: '<p>Reviewed three pull requests from the team. Left detailed comments on the database indexing strategy. One PR needed significant refactoring.</p>', completed: true, tags: ['review', 'team'], mood: 'good' },
      { startTime: '12:00', endTime: '13:00', type: 'JOURNAL', title: 'Documentation', content: '<p>Wrote API documentation for the new endpoints. Used Swagger/OpenAPI format. The docs are now auto-generated from the route definitions.</p>', completed: true, tags: ['documentation'] },
      { startTime: '13:00', endTime: '14:00', type: 'BREAK', title: 'Lunch break', completed: false },
      { startTime: '14:00', endTime: '15:00', type: 'JOURNAL', title: 'Team standup + planning', content: '<p>Team sync went well. Discussed blockers. Decided to push the release by one day to allow more testing time.</p>', completed: true, tags: ['team', 'meetings'], mood: 'neutral' },
      { startTime: '15:00', endTime: '16:00', type: 'JOURNAL', title: 'Feature development', content: '<p>Built the search functionality. Full-text search across journal entries is now working. Performance is good even with large datasets.</p>', completed: true, tags: ['coding', 'search'], mood: 'great' },
      { startTime: '16:00', endTime: '17:00', type: 'JOURNAL', title: 'Wrap up', content: '<p>Closed out tasks for the day. Updated the project board. Prepared tomorrow\'s priorities.</p>', completed: true, tags: ['planning'] },
    ]
  );

  // --- Day 2: August 28, 2026 ---
  await createDay(
    '2026-08-28',
    { startTime: '09:00', endTime: '15:00', mode: 'DURATION', blockDuration: 30, breaks: [
      { startTime: '12:30', endTime: '13:15', title: 'Lunch' }
    ] },
    [
      { startTime: '09:00', endTime: '09:30', type: 'JOURNAL', title: 'Morning setup', content: '<p>Organized workspace. Reviewed yesterday\'s notes. Set up the development environment for today\'s work.</p>', completed: true, tags: ['setup'], mood: 'good' },
      { startTime: '09:30', endTime: '10:00', type: 'JOURNAL', title: 'Email + Slack', content: '<p>Responded to 12 messages. One important client request came in that needs attention this week.</p>', completed: true, tags: ['communication'] },
      { startTime: '10:00', endTime: '10:30', type: 'JOURNAL', title: 'Frontend work', content: '<p>Started on the timeline UI component. The vertical layout is coming together nicely.</p>', completed: true, tags: ['frontend', 'coding'], mood: 'great' },
      { startTime: '10:30', endTime: '11:00', type: 'JOURNAL', title: 'Frontend continued', content: '<p>Implemented the block editor with autosave. Debounced at 1000ms. Works smoothly.</p>', completed: true, tags: ['frontend', 'coding'], mood: 'great' },
      { startTime: '11:00', endTime: '11:30', type: 'JOURNAL', title: 'Testing', content: '<p>Wrote unit tests for the timeline generation algorithm. All 10 test cases pass.</p>', completed: true, tags: ['testing'], mood: 'good' },
      { startTime: '11:30', endTime: '12:00', type: 'JOURNAL', title: 'Bug fixes', content: '<p>Fixed a timezone handling bug where entries created after midnight were being assigned to the wrong date.</p>', completed: true, tags: ['bugfix'] },
      { startTime: '12:00', endTime: '12:30', type: 'JOURNAL', title: 'Pre-lunch prep', content: '<p>Committed work in progress. Made note of where to pick up after lunch.</p>', completed: true, tags: ['planning'] },
      { startTime: '12:30', endTime: '13:15', type: 'BREAK', title: 'Lunch break', completed: false },
      { startTime: '13:15', endTime: '13:45', type: 'JOURNAL', title: 'Database optimization', content: '<p>Added indexes to improve query performance. Search queries are now 3x faster.</p>', completed: true, tags: ['database', 'performance'], mood: 'good' },
      { startTime: '13:45', endTime: '14:15', type: 'JOURNAL', title: 'Deploy preparation', content: '<p>Set up CI/CD pipeline. Configured environment variables for staging.</p>', completed: true, tags: ['devops'] },
      { startTime: '14:15', endTime: '14:45', type: 'JOURNAL', title: 'Documentation update', content: '<p>Updated README with latest setup instructions.</p>', completed: false, tags: ['documentation'] },
      { startTime: '14:45', endTime: '15:00', type: 'JOURNAL', title: 'End of day', content: '', completed: false },
    ]
  );

  // --- Day 3: August 29, 2026 ---
  await createDay(
    '2026-08-29',
    { startTime: '09:00', endTime: '15:00', mode: 'DURATION', blockDuration: 30, breaks: [
      { startTime: '12:30', endTime: '13:15', title: 'Lunch' }
    ] },
    [
      { startTime: '09:00', endTime: '09:30', type: 'JOURNAL', title: 'Morning preparation', content: '<p>Planned the day\'s tasks and reviewed pending items from yesterday.</p>', completed: true, tags: ['planning'], mood: 'good' },
      { startTime: '09:30', endTime: '10:00', type: 'JOURNAL', title: 'Started project review', content: '<p>Deep dive into project status. Everything on track for the end of sprint.</p>', completed: true, tags: ['review'], mood: 'great' },
      { startTime: '10:00', endTime: '10:30', type: 'JOURNAL', title: 'Current block', content: '', completed: false },
      { startTime: '10:30', endTime: '11:00', type: 'JOURNAL', title: '', content: '', completed: false },
      { startTime: '11:00', endTime: '11:30', type: 'JOURNAL', title: '', content: '', completed: false },
      { startTime: '11:30', endTime: '12:00', type: 'JOURNAL', title: '', content: '', completed: false },
      { startTime: '12:00', endTime: '12:30', type: 'JOURNAL', title: '', content: '', completed: false },
      { startTime: '12:30', endTime: '13:15', type: 'BREAK', title: 'Lunch break', completed: false },
      { startTime: '13:15', endTime: '13:45', type: 'JOURNAL', title: '', content: '', completed: false },
      { startTime: '13:45', endTime: '14:15', type: 'JOURNAL', title: '', content: '', completed: false },
      { startTime: '14:15', endTime: '14:45', type: 'JOURNAL', title: '', content: '', completed: false },
      { startTime: '14:45', endTime: '15:00', type: 'JOURNAL', title: '', content: '', completed: false },
    ]
  );

  // --- Templates ---
  await prisma.template.createMany({
    data: [
      {
        userId: user.id,
        name: 'Work Day',
        description: 'Standard 9-5 workday with lunch break',
        startTime: '09:00',
        endTime: '17:00',
        mode: 'DURATION',
        defaultBlockDuration: 60,
        breaks: JSON.stringify([{ startTime: '13:00', endTime: '14:00', title: 'Lunch' }]),
      },
      {
        userId: user.id,
        name: 'Focus Day',
        description: 'Deep work blocks with minimal breaks',
        startTime: '09:00',
        endTime: '15:00',
        mode: 'DURATION',
        defaultBlockDuration: 90,
        breaks: JSON.stringify([
          { startTime: '11:30', endTime: '11:45', title: 'Short break' },
          { startTime: '13:00', endTime: '13:30', title: 'Lunch' },
        ]),
      },
      {
        userId: user.id,
        name: 'Study Session',
        description: 'Pomodoro-style study blocks',
        startTime: '08:00',
        endTime: '14:00',
        mode: 'DURATION',
        defaultBlockDuration: 25,
        breaks: JSON.stringify([
          { startTime: '09:45', endTime: '10:00', title: 'Break' },
          { startTime: '11:45', endTime: '12:00', title: 'Break' },
          { startTime: '12:00', endTime: '12:30', title: 'Lunch' },
        ]),
      },
      {
        userId: user.id,
        name: 'Weekend Morning',
        description: 'Relaxed weekend morning routine',
        startTime: '10:00',
        endTime: '14:00',
        mode: 'SECTIONS',
        numberOfSections: 6,
        breaks: JSON.stringify([]),
      },
    ],
  });

  console.log('✅ Created templates');
  console.log('');
  console.log('🎉 Seed complete!');
  console.log('');
  console.log('Demo account:');
  console.log('  Email:    demo@dayblocks.app');
  console.log('  Password: demo1234');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
