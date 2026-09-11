import assert from "node:assert/strict";
import test from "node:test";

import "reflect-metadata";
import { RoomsService } from "../src/catalog/rooms.service.ts";
import { PathsService } from "../src/catalog/paths.service.ts";

const TEACHER_A = "11111111-1111-1111-1111-111111111111";
const TEACHER_B = "22222222-2222-2222-2222-222222222222";
const ADMIN = "33333333-3333-3333-3333-333333333333";

const ROOM_OF_A = "aaaaaaaa-0000-0000-0000-000000000001";
const ROOM_OF_B = "bbbbbbbb-0000-0000-0000-000000000001";
const PATH_OF_A = "aaaaaaaa-0000-0000-0000-000000000002";
const PATH_OF_B = "bbbbbbbb-0000-0000-0000-000000000002";
const MODULE_OF_A = "aaaaaaaa-0000-0000-0000-000000000003";
const MODULE_OF_B = "bbbbbbbb-0000-0000-0000-000000000003";

const TASK_IN_A = "aaaaaaaa-0000-0000-0000-000000000004";
const TASK_IN_B = "bbbbbbbb-0000-0000-0000-000000000004";

function teacher(id) {
  return { id, profile: { role: "TEACHER", accountStatus: "ACTIVE", organizationId: null } };
}

function admin() {
  return { id: ADMIN, profile: { role: "ADMIN", accountStatus: "ACTIVE", organizationId: null } };
}

/// Minimal stand-in for PrismaService. Only the reads the guards make are
/// implemented; a write that the guard should have blocked shows up as a
/// "must not be reached" failure rather than as a silent pass.
function fakePrisma(overrides = {}) {
  const rooms = {
    [ROOM_OF_A]: { id: ROOM_OF_A, createdById: TEACHER_A },
    [ROOM_OF_B]: { id: ROOM_OF_B, createdById: TEACHER_B },
  };
  const paths = {
    [PATH_OF_A]: { id: PATH_OF_A, createdById: TEACHER_A },
    [PATH_OF_B]: { id: PATH_OF_B, createdById: TEACHER_B },
  };
  const modules = {
    [MODULE_OF_A]: { id: MODULE_OF_A, createdById: TEACHER_A },
    [MODULE_OF_B]: { id: MODULE_OF_B, createdById: TEACHER_B },
  };
  const tasks = {
    [TASK_IN_A]: { id: TASK_IN_A, roomId: ROOM_OF_A },
    [TASK_IN_B]: { id: TASK_IN_B, roomId: ROOM_OF_B },
  };

  const writes = [];

  return {
    writes,
    room: {
      findUnique: async ({ where }) => rooms[where.id] ?? null,
      update: async (args) => {
        writes.push(["room.update", args]);

        // Shaped for toRoomDetailForAuthor, which the service serialises with.
        return {
          ...rooms[args.where.id],
          objectives: [],
          tasks: [],
          module: { id: "m", slug: "m", title: "M", path: { id: "p", slug: "p", title: "P" } },
        };
      },
    },
    task: {
      findUnique: async ({ where }) => tasks[where.id] ?? null,
      deleteMany: async ({ where }) => {
        writes.push(["task.deleteMany", where]);
        const task = tasks[where.id];
        return { count: task && task.roomId === where.roomId ? 1 : 0 };
      },
    },
    path: {
      findUnique: async ({ where }) => paths[where.id] ?? null,
      update: async (args) => {
        writes.push(["path.update", args]);
        return paths[args.where.id];
      },
      create: async (args) => {
        writes.push(["path.create", args]);
        return { id: "new-path", ...args.data };
      },
    },
    learningModule: {
      findUnique: async ({ where }) => modules[where.id] ?? null,
      update: async (args) => {
        writes.push(["module.update", args]);
        return modules[args.where.id];
      },
      create: async (args) => {
        writes.push(["module.create", args]);
        return { id: "new-module", ...args.data };
      },
    },
    ...overrides,
  };
}

/// Stand-in for AuditService. Never throws, records what it was asked.
function fakeAudit() {
  const entries = [];
  return { entries, record: async (entry) => void entries.push(entry) };
}

async function statusOf(promise) {
  try {
    await promise;
    return 200;
  } catch (error) {
    return error.getStatus ? error.getStatus() : 500;
  }
}

// ---------------------------------------------------------------------------
// Rooms
// ---------------------------------------------------------------------------

test("teacher A cannot read the answer key of teacher B's room", async () => {
  const prisma = fakePrisma();
  const rooms = new RoomsService(prisma, fakeAudit());

  assert.equal(await statusOf(rooms.findByIdForAuthor(teacher(TEACHER_A), ROOM_OF_B)), 403);
});

test("teacher A cannot update teacher B's room, and no write is attempted", async () => {
  const prisma = fakePrisma();
  const rooms = new RoomsService(prisma, fakeAudit());

  assert.equal(await statusOf(rooms.update(teacher(TEACHER_A), ROOM_OF_B, { title: "x" })), 403);
  assert.deepEqual(prisma.writes, []);
});

test("teacher A can update their own room", async () => {
  const prisma = fakePrisma();
  const rooms = new RoomsService(prisma, fakeAudit());

  assert.equal(await statusOf(rooms.update(teacher(TEACHER_A), ROOM_OF_A, { title: "x" })), 200);
});

test("an admin can update any room", async () => {
  const prisma = fakePrisma();
  const rooms = new RoomsService(prisma, fakeAudit());

  assert.equal(await statusOf(rooms.update(admin(), ROOM_OF_B, { title: "x" })), 200);
});

test("a pending teacher cannot manage even their own room", async () => {
  const prisma = fakePrisma();
  const rooms = new RoomsService(prisma, fakeAudit());
  const pending = {
    id: TEACHER_A,
    profile: { role: "TEACHER", accountStatus: "PENDING", organizationId: null },
  };

  assert.equal(await statusOf(rooms.update(pending, ROOM_OF_A, { title: "x" })), 403);
});

test("a missing room is 404, not 403", async () => {
  const prisma = fakePrisma();
  const rooms = new RoomsService(prisma, fakeAudit());

  assert.equal(
    await statusOf(
      rooms.findByIdForAuthor(teacher(TEACHER_A), "99999999-9999-9999-9999-999999999999"),
    ),
    404,
  );
});

test("teacher A cannot add a task to teacher B's room", async () => {
  const prisma = fakePrisma();
  const rooms = new RoomsService(prisma, fakeAudit());

  assert.equal(
    await statusOf(rooms.upsertTask(teacher(TEACHER_A), ROOM_OF_B, { title: "t" })),
    403,
  );
  assert.deepEqual(prisma.writes, []);
});

test("a task id from another room is rejected even when the room is owned", async () => {
  const prisma = fakePrisma();
  const rooms = new RoomsService(prisma, fakeAudit());

  // Teacher A owns ROOM_OF_A, but TASK_IN_B hangs off ROOM_OF_B.
  assert.equal(
    await statusOf(rooms.upsertTask(teacher(TEACHER_A), ROOM_OF_A, { title: "t" }, TASK_IN_B)),
    404,
  );
  assert.deepEqual(prisma.writes, []);
});

test("deleting a task is scoped to its room", async () => {
  const prisma = fakePrisma();
  const rooms = new RoomsService(prisma, fakeAudit());

  assert.equal(await statusOf(rooms.removeTask(teacher(TEACHER_A), ROOM_OF_B, TASK_IN_B)), 403);
  assert.equal(await statusOf(rooms.removeTask(teacher(TEACHER_A), ROOM_OF_A, TASK_IN_B)), 404);
  assert.equal(await statusOf(rooms.removeTask(teacher(TEACHER_A), ROOM_OF_A, TASK_IN_A)), 200);
});

// ---------------------------------------------------------------------------
// Paths and modules
// ---------------------------------------------------------------------------

test("teacher A cannot update teacher B's path or module", async () => {
  const prisma = fakePrisma();
  const paths = new PathsService(prisma, fakeAudit());

  assert.equal(await statusOf(paths.updatePath(teacher(TEACHER_A), PATH_OF_B, { slug: "s" })), 403);
  assert.equal(
    await statusOf(paths.updateModule(teacher(TEACHER_A), MODULE_OF_B, { slug: "s" })),
    403,
  );
  assert.deepEqual(prisma.writes, []);
});

test("teacher A can update their own path and module", async () => {
  const prisma = fakePrisma();
  const paths = new PathsService(prisma, fakeAudit());

  assert.equal(await statusOf(paths.updatePath(teacher(TEACHER_A), PATH_OF_A, { slug: "s" })), 200);
  assert.equal(
    await statusOf(paths.updateModule(teacher(TEACHER_A), MODULE_OF_A, { slug: "s" })),
    200,
  );
});

test("teacher A cannot create a module under teacher B's path", async () => {
  const prisma = fakePrisma();
  const paths = new PathsService(prisma, fakeAudit());

  assert.equal(
    await statusOf(
      paths.createModule(teacher(TEACHER_A), { pathId: PATH_OF_B, slug: "s", title: "t" }),
    ),
    403,
  );
  assert.deepEqual(prisma.writes, []);
});

test("a teacher cannot re-parent their module onto somebody else's path", async () => {
  const prisma = fakePrisma();
  const paths = new PathsService(prisma, fakeAudit());

  assert.equal(
    await statusOf(paths.updateModule(teacher(TEACHER_A), MODULE_OF_A, { pathId: PATH_OF_B })),
    403,
  );
  assert.deepEqual(prisma.writes, []);
});

// ---------------------------------------------------------------------------
// Publish workflow (the live PoC from the pentest report)
// ---------------------------------------------------------------------------

test("a teacher cannot publish their own module through PATCH", async () => {
  const prisma = fakePrisma();
  const paths = new PathsService(prisma, fakeAudit());

  await paths.updateModule(teacher(TEACHER_A), MODULE_OF_A, {
    slug: "dd",
    title: "dd",
    status: "PUBLISHED",
  });

  const [, args] = prisma.writes.at(-1);

  assert.equal(args.data.status, undefined, "status must be stripped for a non-admin");
});

test("a teacher cannot publish a path through PATCH or POST", async () => {
  const prisma = fakePrisma();
  const paths = new PathsService(prisma, fakeAudit());

  await paths.updatePath(teacher(TEACHER_A), PATH_OF_A, { slug: "s", status: "PUBLISHED" });
  assert.equal(prisma.writes.at(-1)[1].data.status, undefined);

  await paths.createPath(teacher(TEACHER_A), { slug: "s", title: "t", status: "PUBLISHED" });
  assert.equal(prisma.writes.at(-1)[1].data.status, undefined);
  assert.equal(prisma.writes.at(-1)[1].data.createdById, TEACHER_A);
});

test("an admin keeps the ability to publish", async () => {
  const prisma = fakePrisma();
  const paths = new PathsService(prisma, fakeAudit());

  await paths.updateModule(admin(), MODULE_OF_B, { slug: "s", status: "PUBLISHED" });

  assert.equal(prisma.writes.at(-1)[1].data.status, "PUBLISHED");
});

// ---------------------------------------------------------------------------
// Rows that predate the ownership column
// ---------------------------------------------------------------------------

test("a module with no recorded author is admin-only", async () => {
  const prisma = fakePrisma({
    learningModule: {
      findUnique: async () => ({ createdById: null }),
      update: async (args) => args,
    },
  });
  const paths = new PathsService(prisma, fakeAudit());

  assert.equal(
    await statusOf(paths.updateModule(teacher(TEACHER_A), MODULE_OF_A, { slug: "s" })),
    403,
  );
  assert.equal(await statusOf(paths.updateModule(admin(), MODULE_OF_A, { slug: "s" })), 200);
});

// ---------------------------------------------------------------------------
// Audit trail
// ---------------------------------------------------------------------------

test("an admin publishing a room leaves an audit entry naming the actor", async () => {
  const prisma = fakePrisma();
  const audit = fakeAudit();
  const rooms = new RoomsService(prisma, audit);

  await rooms.setStatus(admin(), ROOM_OF_B, "PUBLISHED");

  assert.equal(audit.entries.length, 1);
  assert.deepEqual(
    { actorId: audit.entries[0].actorId, action: audit.entries[0].action, targetId: audit.entries[0].targetId },
    { actorId: ADMIN, action: "room.publish", targetId: ROOM_OF_B },
  );
});
