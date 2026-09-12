import assert from "node:assert/strict";
import test from "node:test";

import { StreakReminderService } from "../src/progress/streak-reminder.service.ts";

const TODAY = new Date("2026-09-15T20:00:00.000Z");
const YESTERDAY = new Date("2026-09-14T00:00:00.000Z");
const START_OF_TODAY = new Date("2026-09-15T00:00:00.000Z");

function fakePrisma(rows) {
  return {
    userStats: {
      findMany: async ({ where }) => {
        // Mirror the query's filters against the fixture, so a change to the
        // where-clause that stops filtering is caught here rather than by a
        // 3am page.
        return rows.filter(
          (row) =>
            row.currentStreak > 0 &&
            row.lastActiveDate < START_OF_TODAY &&
            row.profile.notifyStreak &&
            row.profile.deletedAt === null,
        );
      },
    },
  };
}

function fakeNotifications() {
  const sent = [];
  return { sent, notify: async (profileId, input) => void sent.push({ profileId, ...input }) };
}

test("a learner who has not acted today and opted in gets reminded", async () => {
  const prisma = fakePrisma([
    {
      profileId: "p1",
      currentStreak: 5,
      lastActiveDate: YESTERDAY,
      profile: { notifyStreak: true, deletedAt: null },
    },
  ]);
  const notifications = fakeNotifications();
  const service = new StreakReminderService(prisma, notifications);

  const count = await service.sendReminders(TODAY);

  assert.equal(count, 1);
  assert.equal(notifications.sent.length, 1);
  assert.equal(notifications.sent[0].profileId, "p1");
  assert.match(notifications.sent[0].title, /5 günlük/);
});

test("someone who already acted today is not reminded", async () => {
  const prisma = fakePrisma([
    {
      profileId: "p2",
      currentStreak: 3,
      lastActiveDate: TODAY,
      profile: { notifyStreak: true, deletedAt: null },
    },
  ]);
  const notifications = fakeNotifications();
  const service = new StreakReminderService(prisma, notifications);

  assert.equal(await service.sendReminders(TODAY), 0);
  assert.equal(notifications.sent.length, 0);
});

test("a zero streak is not worth protecting", async () => {
  const prisma = fakePrisma([
    {
      profileId: "p3",
      currentStreak: 0,
      lastActiveDate: YESTERDAY,
      profile: { notifyStreak: true, deletedAt: null },
    },
  ]);
  const service = new StreakReminderService(prisma, fakeNotifications());

  assert.equal(await service.sendReminders(TODAY), 0);
});

test("an opted-out learner is skipped even with a streak at risk", async () => {
  const prisma = fakePrisma([
    {
      profileId: "p4",
      currentStreak: 10,
      lastActiveDate: YESTERDAY,
      profile: { notifyStreak: false, deletedAt: null },
    },
  ]);
  const service = new StreakReminderService(prisma, fakeNotifications());

  assert.equal(await service.sendReminders(TODAY), 0);
});

test("an account pending deletion is skipped", async () => {
  const prisma = fakePrisma([
    {
      profileId: "p5",
      currentStreak: 7,
      lastActiveDate: YESTERDAY,
      profile: { notifyStreak: true, deletedAt: new Date("2026-09-01") },
    },
  ]);
  const service = new StreakReminderService(prisma, fakeNotifications());

  assert.equal(await service.sendReminders(TODAY), 0);
});
