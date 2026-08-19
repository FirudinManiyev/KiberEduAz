import assert from "node:assert/strict";
import { test } from "node:test";

import {
  LOCAL_PROGRESS_KEY,
  completeLocalTask,
  emptyLocalProgress,
  parseLocalProgress,
  serializeLocalProgress,
  setLastVisitedTask,
  solveLocalQuestion,
} from "../src/lib/content/local-progress.ts";

test("local progress uses a stable versioned storage key", () => {
  assert.equal(LOCAL_PROGRESS_KEY, "kibereduaz:room-progress:v1");
  assert.deepEqual(emptyLocalProgress(), { version: 1, rooms: {} });
});

test("task and question completion award points once", () => {
  let state = emptyLocalProgress();
  state = solveLocalQuestion(state, "blue-room", "task-1", "q-1", 20);
  state = solveLocalQuestion(state, "blue-room", "task-1", "q-1", 20);
  state = completeLocalTask(state, "blue-room", "task-1", 100);
  state = completeLocalTask(state, "blue-room", "task-1", 100);

  assert.deepEqual(state.rooms["blue-room"], {
    completedTaskIds: ["task-1"],
    solvedQuestionIds: ["q-1"],
    earnedPoints: 120,
    lastTaskId: "task-1",
  });
});

test("serialized progress restores the last visited task", () => {
  const state = setLastVisitedTask(emptyLocalProgress(), "risk-room", "risk-task-3");
  const restored = parseLocalProgress(serializeLocalProgress(state));

  assert.deepEqual(restored, {
    version: 1,
    rooms: {
      "risk-room": {
        completedTaskIds: [],
        solvedQuestionIds: [],
        earnedPoints: 0,
        lastTaskId: "risk-task-3",
      },
    },
  });
});

test("corrupt, malformed, and mismatched progress falls back to empty state", () => {
  assert.deepEqual(parseLocalProgress("not-json"), emptyLocalProgress());
  assert.deepEqual(parseLocalProgress('{"version":2,"rooms":{}}'), emptyLocalProgress());
  assert.deepEqual(
    parseLocalProgress('{"version":1,"rooms":{"x":{"completedTaskIds":"bad"}}}'),
    emptyLocalProgress(),
  );
  assert.deepEqual(parseLocalProgress(null), emptyLocalProgress());
});
