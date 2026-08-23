# KiberEduAz Onboarding, Error UX and Landing Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add mandatory backend-persisted onboarding for new accounts, safe role-aware error and loading UX, the supplied KiberEduAz logo, and a responsive image-free landing redesign.

**Architecture:** Prisma stores one structured onboarding response per profile and exposes completion through the existing profile API. NestJS owns validation and a sanitized public error envelope; Next.js owns authenticated onboarding routing, audience-aware display messages, loading primitives, and the landing presentation. Pure routing, validation, error-mapping, and content catalogs are separated from UI so they can be tested before integration.

**Tech Stack:** Next.js 16.3, React 19.2, TypeScript 5, Tailwind CSS 4, NestJS 11, Prisma 6.16, PostgreSQL, Supabase auth, Node test runner with `tsx`.

**Spec:** `docs/superpowers/specs/2026-08-23-onboarding-error-ux-landing-redesign-design.md`

## Global Constraints

- Existing profiles are backfilled as onboarding-complete; only profiles created after the migration remain incomplete.
- Onboarding has exactly four required single-choice questions; `referralOther` is required only for `OTHER` and is limited to 160 characters.
- The onboarding write is idempotent, one-to-one with `Profile`, and preserves the first completion timestamp.
- Learner UI never renders raw exception messages, stack traces, Prisma metadata, SQL, internal endpoints, or validation objects.
- Staff UI may render a safe operation message, HTTP status, and `requestId`; detailed diagnostics remain in logs.
- `frontend/public/kibereduaz_logo.png` is the single logo asset and must not be altered.
- Preserve the existing Silk background configuration: speed `5.1`, scale `0.7`, color `#2304a2`, noise intensity `1`, rotation `0`.
- Loading indicators represent real pending work; no fixed minimum delay and no duplicate overlays for one operation.
- New UI copy is Azerbaijani, supports keyboard navigation, reduced motion, and 320px-wide screens without horizontal overflow.
- Follow test-first Red → Green → Refactor for every production behavior.

---

### Task 1: Establish the Backend Test Harness and Safe Public Error Contract

**Files:**
- Modify: `backend/package.json`
- Modify: `backend/package-lock.json`
- Create: `backend/test/public-error.test.ts`
- Create: `backend/src/common/public-error.ts`
- Create: `backend/src/common/http-exception.filter.ts`
- Modify: `backend/src/main.ts`
- Delete: `backend/src/common/prisma-exception.filter.ts`

**Interfaces:**
- Produces: `PublicErrorEnvelope { statusCode, code, message, requestId }`
- Produces: `toPublicError(exception: unknown, requestId: string): PublicErrorEnvelope`
- Produces: `HttpExceptionFilter`, registered once as the global Nest filter

- [ ] **Step 1: Add a backend test command and write the failing safe-envelope tests**

Add `tsx` to backend dev dependencies and set:

```json
"test": "tsx --test test/*.test.ts"
```

Create `backend/test/public-error.test.ts` with focused cases:

```ts
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ConflictException, HttpException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { toPublicError } from '../src/common/public-error';

test('unknown exceptions become a generic 500 without leaking the raw message', () => {
  const result = toPublicError(new Error('password=secret SELECT * FROM profiles'), 'req-500');
  assert.deepEqual(result, {
    statusCode: 500,
    code: 'INTERNAL_ERROR',
    message: 'Əməliyyatı hazırda tamamlamaq mümkün olmadı.',
    requestId: 'req-500',
  });
});

test('conflicts use a stable safe code and message', () => {
  const result = toPublicError(new ConflictException('users_email_key'), 'req-409');
  assert.equal(result.statusCode, 409);
  assert.equal(result.code, 'CONFLICT');
  assert.equal(result.message, 'Bu məlumat artıq mövcuddur və ya əməliyyat cari vəziyyətə uyğun deyil.');
  assert.equal(JSON.stringify(result).includes('users_email_key'), false);
});

test('Prisma metadata never appears in the public response', () => {
  const prismaError = new Prisma.PrismaClientKnownRequestError('Unique constraint failed on email', {
    code: 'P2002',
    clientVersion: '6.16.2',
    meta: { target: ['email'] },
  });
  const result = toPublicError(prismaError, 'req-db');
  assert.equal(result.code, 'CONFLICT');
  assert.equal(JSON.stringify(result).includes('email'), false);
});

test('429 responses use the public rate-limit copy', () => {
  const result = toPublicError(new HttpException('internal throttle state', 429), 'req-429');
  assert.equal(result.code, 'RATE_LIMITED');
  assert.equal(result.message, 'Çox sayda cəhd edildi. Bir qədər sonra yenidən yoxlayın.');
});
```

- [ ] **Step 2: Run the backend test and verify the expected failure**

Run:

```powershell
cd backend
npm install
npx tsx --test test/public-error.test.ts
```

Expected: FAIL because `src/common/public-error.ts` does not exist.

- [ ] **Step 3: Implement the pure mapping and global filter**

Implement `toPublicError` with a closed status map:

```ts
export const PUBLIC_ERRORS = {
  400: ['VALIDATION_ERROR', 'Daxil etdiyiniz məlumatları yoxlayın.'],
  401: ['UNAUTHENTICATED', 'Sessiyanız bitib. Yenidən daxil olun.'],
  403: ['FORBIDDEN', 'Bu əməliyyat üçün icazəniz yoxdur.'],
  404: ['NOT_FOUND', 'Axtardığınız məlumat tapılmadı.'],
  409: ['CONFLICT', 'Bu məlumat artıq mövcuddur və ya əməliyyat cari vəziyyətə uyğun deyil.'],
  429: ['RATE_LIMITED', 'Çox sayda cəhd edildi. Bir qədər sonra yenidən yoxlayın.'],
} as const;
```

Map Prisma `P2002` and `P2003` to 409, `P2025` to 404, all other Prisma errors to 500, and all unknown exceptions to 500. `HttpExceptionFilter.catch` must generate a UUID request ID, log the original exception with method and URL, then reply only with `toPublicError(...)`.

Replace `PrismaExceptionFilter` registration in `main.ts` with the new catch-all filter. Keep CORS and validation setup unchanged.

- [ ] **Step 4: Verify the error contract and backend build**

Run:

```powershell
cd backend
npx tsx --test test/public-error.test.ts
npm run build
```

Expected: all public-error tests PASS and Nest build exits `0`.

- [ ] **Step 5: Commit the isolated backend safety foundation**

```powershell
git add backend/package.json backend/package-lock.json backend/test/public-error.test.ts backend/src/common/public-error.ts backend/src/common/http-exception.filter.ts backend/src/common/prisma-exception.filter.ts backend/src/main.ts
git commit -m "feat(api): sanitize public error responses"
```

---

### Task 2: Add the Onboarding Schema and Existing-Account Backfill

**Files:**
- Create: `backend/test/onboarding-schema.test.ts`
- Modify: `backend/prisma/schema.prisma`
- Create: `backend/prisma/migrations/20260823000000_profile_onboarding/migration.sql`

**Interfaces:**
- Produces: Prisma enums `CyberExperienceLevel`, `PracticalExperience`, `LearningTrack`, `ReferralSource`
- Produces: `Profile.onboardingCompletedAt` and `Profile.onboardingResponse`
- Produces: one-to-one `OnboardingResponse` model keyed by `profileId`

- [ ] **Step 1: Write a failing migration-contract test**

Create `backend/test/onboarding-schema.test.ts`:

```ts
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const schemaPath = new URL('../prisma/schema.prisma', import.meta.url);
const migrationPath = new URL(
  '../prisma/migrations/20260823000000_profile_onboarding/migration.sql',
  import.meta.url,
);

test('Prisma defines one onboarding response per profile', async () => {
  const schema = await readFile(schemaPath, 'utf8');
  assert.match(schema, /model OnboardingResponse/);
  assert.match(schema, /profileId\s+String\s+@id/);
  assert.match(schema, /onboardingCompletedAt\s+DateTime\?/);
});

test('migration backfills existing profiles before new accounts arrive', async () => {
  const sql = await readFile(migrationPath, 'utf8');
  assert.match(sql, /UPDATE "profiles" SET "onboarding_completed_at" = CURRENT_TIMESTAMP/i);
  assert.match(sql, /CREATE TABLE "onboarding_responses"/i);
  assert.match(sql, /ON DELETE CASCADE/i);
});
```

- [ ] **Step 2: Run the schema test and verify the expected failure**

Run:

```powershell
cd backend
npx tsx --test test/onboarding-schema.test.ts
```

Expected: FAIL because the migration and Prisma model do not exist.

- [ ] **Step 3: Add the Prisma model, enums, and SQL migration**

Add the four enums exactly as named in the spec. Add to `Profile`:

```prisma
onboardingCompletedAt DateTime?           @map("onboarding_completed_at") @db.Timestamptz(6)
onboardingResponse    OnboardingResponse?
```

Add the model:

```prisma
model OnboardingResponse {
  profileId          String               @id @map("profile_id") @db.Uuid
  experienceLevel    CyberExperienceLevel @map("experience_level")
  practicalExperience PracticalExperience @map("practical_experience")
  learningTrack      LearningTrack        @map("learning_track")
  referralSource     ReferralSource       @map("referral_source")
  referralOther      String?              @map("referral_other") @db.VarChar(160)
  createdAt          DateTime             @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt          DateTime             @default(now()) @updatedAt @map("updated_at") @db.Timestamptz(6)

  profile Profile @relation(fields: [profileId], references: [id], onDelete: Cascade)

  @@map("onboarding_responses")
}
```

The SQL migration must create mapped PostgreSQL enums, add the nullable timestamp, immediately update existing rows to `CURRENT_TIMESTAMP`, create the response table, and add the cascade foreign key.

- [ ] **Step 4: Verify schema, migration contract, and generated Prisma client**

Run:

```powershell
cd backend
npx tsx --test test/onboarding-schema.test.ts
npx prisma format
npm run prisma:generate
npm run build
```

Expected: schema tests PASS, Prisma generation succeeds, and backend build exits `0`.

- [ ] **Step 5: Commit the persistence layer**

```powershell
git add backend/prisma/schema.prisma backend/prisma/migrations/20260823000000_profile_onboarding/migration.sql backend/test/onboarding-schema.test.ts
git commit -m "feat(api): persist account onboarding responses"
```

---

### Task 3: Implement Validated, Idempotent Onboarding API Behavior

**Files:**
- Create: `backend/test/onboarding.dto.test.ts`
- Create: `backend/test/profiles-onboarding.test.ts`
- Create: `backend/src/profiles/dto/onboarding.dto.ts`
- Modify: `backend/src/profiles/profiles.service.ts`
- Modify: `backend/src/profiles/profiles.controller.ts`

**Interfaces:**
- Consumes: Prisma onboarding enums and model from Task 2
- Produces: `SubmitOnboardingDto`
- Produces: `ProfilesService.submitOnboarding(user, dto)` returning the same serialized profile shape as `ProfilesService.me(user)`
- Produces: authenticated `PUT /profiles/me/onboarding`
- Produces: `GET /profiles/me` fields `onboardingCompletedAt: string | null` and `onboardingCompleted: boolean`

- [ ] **Step 1: Write failing DTO validation tests**

Create `backend/test/onboarding.dto.test.ts`:

```ts
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ReferralSource } from '@prisma/client';
import { SubmitOnboardingDto } from '../src/profiles/dto/onboarding.dto';

const valid = {
  experienceLevel: 'NEW',
  practicalExperience: 'NONE',
  learningTrack: 'UNDECIDED',
  referralSource: 'SOCIAL_MEDIA',
};

test('accepts all four supported onboarding answers', async () => {
  assert.equal((await validate(plainToInstance(SubmitOnboardingDto, valid))).length, 0);
});

test('requires referralOther when referral source is OTHER', async () => {
  const dto = plainToInstance(SubmitOnboardingDto, {
    ...valid,
    referralSource: ReferralSource.OTHER,
    referralOther: '   ',
  });
  assert.ok((await validate(dto)).length > 0);
});

test('rejects unknown enum values', async () => {
  const dto = plainToInstance(SubmitOnboardingDto, { ...valid, learningTrack: 'UNKNOWN' });
  assert.ok((await validate(dto)).length > 0);
});
```

- [ ] **Step 2: Run the DTO tests and verify the expected failure**

Run:

```powershell
cd backend
npx tsx --test test/onboarding.dto.test.ts
```

Expected: FAIL because `SubmitOnboardingDto` does not exist.

- [ ] **Step 3: Implement the DTO with enum and conditional text validation**

Use `@IsEnum` for all four enum fields. Use `@ValidateIf((dto) => dto.referralSource === ReferralSource.OTHER)`, `@IsString`, `@IsNotEmpty`, and `@MaxLength(160)` for `referralOther`. Normalize whitespace in the service, not inside decorators.

- [ ] **Step 4: Verify DTO tests pass**

Run:

```powershell
cd backend
npx tsx --test test/onboarding.dto.test.ts
```

Expected: all DTO tests PASS.

- [ ] **Step 5: Write failing service tests for completion state and idempotency**

In `backend/test/profiles-onboarding.test.ts`, construct `ProfilesService` with a small in-memory Prisma fake. Assert these real service effects:

```ts
test('submitOnboarding upserts answers and sets completion once', async () => {
  const fake = createPrismaFake(null);
  const service = new ProfilesService(fake.prisma);

  const result = await service.submitOnboarding(USER, ANSWERS);

  assert.equal(fake.responses.size, 1);
  assert.equal(result.onboardingCompleted, true);
  assert.ok(result.onboardingCompletedAt instanceof Date);
});

test('a retry updates one response and preserves the first completion timestamp', async () => {
  const original = new Date('2026-08-23T12:00:00.000Z');
  const fake = createPrismaFake(original);
  const service = new ProfilesService(fake.prisma);

  await service.submitOnboarding(USER, { ...ANSWERS, learningTrack: LearningTrack.BLUE_TEAM });

  assert.equal(fake.responses.size, 1);
  assert.equal(fake.profile.onboardingCompletedAt, original);
  assert.equal(fake.responses.get(USER.id)?.learningTrack, LearningTrack.BLUE_TEAM);
});
```

Define the fake in the same test file so it implements only the service surface:

```ts
function createPrismaFake(onboardingCompletedAt: Date | null) {
  const profile = {
    id: USER.id,
    email: USER.email,
    fullName: null,
    username: null,
    role: UserRole.STUDENT,
    accountStatus: AccountStatus.ACTIVE,
    avatarKey: null,
    bio: null,
    institutionName: null,
    classLabel: null,
    focusTrack: null,
    weeklyGoal: 5,
    organizationId: null,
    notifyNewRooms: true,
    notifyStreak: true,
    notifyLeaderboard: false,
    onboardingCompletedAt,
  };
  const responses = new Map<string, SubmitOnboardingDto>();
  const profileApi = {
    async findUniqueOrThrow() { return profile; },
    async update({ data }: { data: { onboardingCompletedAt?: Date } }) {
      if (data.onboardingCompletedAt) profile.onboardingCompletedAt = data.onboardingCompletedAt;
      return profile;
    },
  };
  const transactionApi = {
    profile: profileApi,
    onboardingResponse: {
      async upsert({ create, update }: { create: SubmitOnboardingDto & { profileId: string }; update: SubmitOnboardingDto }) {
        responses.set(USER.id, responses.has(USER.id) ? update : create);
      },
    },
  };
  const prisma = {
    ...transactionApi,
    async $transaction<T>(callback: (tx: typeof transactionApi) => Promise<T>) {
      return callback(transactionApi);
    },
    userStats: { async findUnique() { return null; } },
    classMembership: { async findMany() { return []; } },
    classGroup: { async findMany() { return []; } },
  } as unknown as PrismaService;

  return { prisma, profile, responses };
}
```

- [ ] **Step 6: Run the service tests and verify the expected failure**

Run:

```powershell
cd backend
npx tsx --test test/profiles-onboarding.test.ts
```

Expected: FAIL because `ProfilesService.submitOnboarding` is missing and `me()` omits onboarding fields.

- [ ] **Step 7: Implement the service transaction, serialization, and controller endpoint**

Implement:

```ts
@Put('me/onboarding')
submitOnboarding(@CurrentUser() user: AuthenticatedUser, @Body() dto: SubmitOnboardingDto) {
  return this.profilesService.submitOnboarding(user, dto);
}
```

Within one callback transaction, read the profile, `upsert` the response, null out `referralOther` unless source is `OTHER`, and update `onboardingCompletedAt` only when currently null. Refactor profile response assembly into a private method that includes:

```ts
onboardingCompletedAt: profile.onboardingCompletedAt,
onboardingCompleted: profile.onboardingCompletedAt !== null,
```

- [ ] **Step 8: Verify onboarding API tests and full backend build**

Run:

```powershell
cd backend
npm test
npm run build
```

Expected: all backend tests PASS and build exits `0`.

- [ ] **Step 9: Commit the onboarding API**

```powershell
git add backend/src/profiles/dto/onboarding.dto.ts backend/src/profiles/profiles.service.ts backend/src/profiles/profiles.controller.ts backend/test/onboarding.dto.test.ts backend/test/profiles-onboarding.test.ts
git commit -m "feat(api): add mandatory onboarding endpoint"
```

---

### Task 4: Add the Frontend Error Model and Safe Error Boundaries

**Files:**
- Create: `frontend/tests/api-errors.test.mjs`
- Create: `frontend/src/lib/api/errors.ts`
- Modify: `frontend/src/lib/api/client.ts`
- Modify: `frontend/src/lib/api/server.ts`
- Create: `frontend/src/app/error.tsx`
- Create: `frontend/src/app/global-error.tsx`
- Modify: `frontend/src/app/not-found.tsx`

**Interfaces:**
- Produces: `ApiError(status, code, message, requestId?)`
- Produces: `getDisplayError(error, { audience, context }): DisplayError`
- Produces: `DisplayError { title, message, reference? }`

- [ ] **Step 1: Write failing learner/staff error-mapping tests**

Create `frontend/tests/api-errors.test.mjs`:

```js
import assert from "node:assert/strict";
import { test } from "node:test";
import { ApiError, getDisplayError } from "../src/lib/api/errors.ts";

test("learner errors never expose a raw backend message", () => {
  const source = new ApiError(500, "INTERNAL_ERROR", "Prisma P2002 users_email_key", "req-secret");
  const shown = getDisplayError(source, { audience: "learner", context: "profile" });
  assert.equal(shown.message.includes("Prisma"), false);
  assert.equal(shown.reference, undefined);
});

test("staff errors include a safe request reference without raw detail", () => {
  const source = new ApiError(500, "INTERNAL_ERROR", "SELECT * FROM users", "req-42");
  const shown = getDisplayError(source, { audience: "staff", context: "admin" });
  assert.equal(shown.reference, "Sorğu: req-42 · Status: 500");
  assert.equal(shown.message.includes("SELECT"), false);
});

test("network errors provide a recovery action", () => {
  const shown = getDisplayError(new TypeError("fetch failed"), {
    audience: "learner",
    context: "room",
  });
  assert.match(shown.message, /İnterneti yoxlayıb yenidən cəhd edin/);
});
```

- [ ] **Step 2: Run the tests and verify the expected failure**

Run:

```powershell
cd frontend
npx tsx --experimental-test-module-mocks --test tests/api-errors.test.mjs
```

Expected: FAIL because `src/lib/api/errors.ts` does not exist.

- [ ] **Step 3: Implement the shared error class and audience mapping**

Parse only `{ statusCode, code, message, requestId }` in both API clients. Keep backend `message` inside `ApiError` for diagnostics but never render it directly. `getDisplayError` must choose fixed Azerbaijani copy by network/status/context, attach reference only for `staff`, and log the original cause only in development.

- [ ] **Step 4: Verify error-mapping tests pass**

Run:

```powershell
cd frontend
npx tsx --experimental-test-module-mocks --test tests/api-errors.test.mjs
```

Expected: all error mapping tests PASS.

- [ ] **Step 5: Add safe route, global, and not-found UI**

`error.tsx` is a client component receiving `{ error, reset }`; it uses learner-safe copy and a retry button. `global-error.tsx` renders its own `<html lang="az">` and `<body>`, the logo asset, a generic message, retry, and home link. `not-found.tsx` keeps 404-specific copy and changes its final CTA to “Ana səhifəyə qayıt”. None of these components render `error.message`.

- [ ] **Step 6: Verify frontend tests, lint, and type/build integration**

Run:

```powershell
cd frontend
npm test
npm run lint
npm run build
```

Expected: tests, lint, and production build all exit `0`.

- [ ] **Step 7: Commit the frontend error boundary foundation**

```powershell
git add frontend/src/lib/api/errors.ts frontend/src/lib/api/client.ts frontend/src/lib/api/server.ts frontend/src/app/error.tsx frontend/src/app/global-error.tsx frontend/src/app/not-found.tsx frontend/tests/api-errors.test.mjs
git commit -m "feat(web): add safe role-aware error UX"
```

---

### Task 5: Gate Protected Routes and Build the Mandatory Onboarding Page

**Files:**
- Create: `frontend/tests/onboarding-routing.test.mjs`
- Create: `frontend/tests/onboarding-options.test.mjs`
- Modify: `frontend/tests/proxy.test.mjs`
- Create: `frontend/src/lib/auth/onboarding.ts`
- Modify: `frontend/src/lib/auth/home-path.ts`
- Modify: `frontend/src/lib/api/types.ts`
- Modify: `frontend/src/proxy.ts`
- Modify: `frontend/src/components/auth/auth-form.tsx`
- Modify: `frontend/src/app/auth/callback/route.ts`
- Create: `frontend/src/components/onboarding/onboarding-options.ts`
- Create: `frontend/src/components/onboarding/onboarding-form.tsx`
- Create: `frontend/src/app/onboarding/page.tsx`

**Interfaces:**
- Consumes: `PUT /profiles/me/onboarding` and profile completion fields from Task 3
- Produces: `safeInternalPath(value: string | null): string | null`
- Produces: `homePathFor(profile)` that returns `/onboarding` first when incomplete
- Produces: `ONBOARDING_QUESTIONS` shared UI catalog and `OnboardingPayload`

- [ ] **Step 1: Write failing pure routing and option-catalog tests**

Create routing tests:

```js
import assert from "node:assert/strict";
import { test } from "node:test";
import { safeInternalPath } from "../src/lib/auth/onboarding.ts";
import { homePathFor } from "../src/lib/auth/home-path.ts";

test("incomplete profiles always go to onboarding", () => {
  assert.equal(homePathFor({ role: "ADMIN", accountStatus: "ACTIVE", onboardingCompleted: false }), "/onboarding");
});

test("completed profiles retain role-aware home routes", () => {
  assert.equal(homePathFor({ role: "TEACHER", accountStatus: "PENDING", onboardingCompleted: true }), "/pending");
});

test("only local next paths are accepted", () => {
  assert.equal(safeInternalPath("/rooms/intro"), "/rooms/intro");
  assert.equal(safeInternalPath("//evil.example"), null);
  assert.equal(safeInternalPath("https://evil.example"), null);
});
```

Create option tests that assert four questions, one `OTHER` referral choice, and exact backend enum values.

- [ ] **Step 2: Run routing/catalog tests and verify the expected failure**

Run:

```powershell
cd frontend
npx tsx --experimental-test-module-mocks --test tests/onboarding-routing.test.mjs tests/onboarding-options.test.mjs
```

Expected: FAIL because onboarding routing and option modules do not exist.

- [ ] **Step 3: Implement pure route helpers, types, and the four-question catalog**

Extend `MyProfile` with:

```ts
onboardingCompletedAt: string | null;
onboardingCompleted: boolean;
```

`homePathFor` checks `onboardingCompleted` before role/status. Export question definitions with exact enum values from the spec so UI labels never become API values.

- [ ] **Step 4: Verify pure tests pass**

Run:

```powershell
cd frontend
npx tsx --experimental-test-module-mocks --test tests/onboarding-routing.test.mjs tests/onboarding-options.test.mjs
```

Expected: routing and catalog tests PASS.

- [ ] **Step 5: Write failing proxy tests for incomplete and complete accounts**

Extend the Supabase mock with `getSession()` and mock `globalThis.fetch`. Add:

```js
test("an incomplete signed-in account is redirected from dashboard to onboarding", async () => {
  profile = { role: "STUDENT", accountStatus: "ACTIVE", onboardingCompleted: false };
  const response = await proxy(new NextRequest("http://localhost:3000/dashboard"));
  assert.equal(new URL(response.headers.get("location")).pathname, "/onboarding");
});

test("a completed account is redirected away from onboarding", async () => {
  profile = { role: "STUDENT", accountStatus: "ACTIVE", onboardingCompleted: true };
  const response = await proxy(new NextRequest("http://localhost:3000/onboarding"));
  assert.equal(new URL(response.headers.get("location")).pathname, "/dashboard");
});

test("backend profile outages do not cause a redirect loop", async () => {
  profileRequestFails = true;
  const response = await proxy(new NextRequest("http://localhost:3000/dashboard"));
  assert.equal(response.status, 200);
});
```

- [ ] **Step 6: Run proxy tests and verify the expected failure**

Run:

```powershell
cd frontend
npx tsx --experimental-test-module-mocks --test tests/proxy.test.mjs
```

Expected: new proxy tests FAIL because no profile-based onboarding gate exists.

- [ ] **Step 7: Implement proxy, auth-form, and callback redirects**

After Supabase validates the user, use the access token to fetch `/profiles/me` for non-public routes. Preserve refreshed cookies on every response. Redirect incomplete profiles to onboarding with a sanitized `next`, completed profiles away from onboarding, and leave the request unchanged when profile fetch fails. Make auth form and callback fetch profile and call `homePathFor`; pending teachers complete onboarding before `/pending`.

- [ ] **Step 8: Build the server page and client form**

The server page verifies session/profile and redirects completed accounts. The client form uses native radio inputs inside `fieldset`/`legend`, holds a typed `OnboardingPayload`, conditionally renders the 160-character “Digər” input, disables submit until valid, submits with `apiRequest`, and routes to sanitized `next` or role home. During submit it sets `aria-busy`, shows the existing Lucide pending indicator, and uses learner-safe `getDisplayError` from Task 4. Task 6 replaces that local indicator with the shared loading primitive.

- [ ] **Step 9: Verify onboarding behavior and frontend build**

Run:

```powershell
cd frontend
npm test
npm run lint
npm run build
```

Expected: all frontend tests PASS; lint and build exit `0`.

- [ ] **Step 10: Commit onboarding routing and UI**

```powershell
git add frontend/src/lib/auth/onboarding.ts frontend/src/lib/auth/home-path.ts frontend/src/lib/api/types.ts frontend/src/proxy.ts frontend/src/components/auth/auth-form.tsx frontend/src/app/auth/callback/route.ts frontend/src/components/onboarding/onboarding-options.ts frontend/src/components/onboarding/onboarding-form.tsx frontend/src/app/onboarding/page.tsx frontend/tests/onboarding-routing.test.mjs frontend/tests/onboarding-options.test.mjs frontend/tests/proxy.test.mjs
git commit -m "feat(web): require onboarding for new accounts"
```

---

### Task 6: Integrate the Supplied Logo and Real Pending-State Loading

**Files:**
- Create: `frontend/tests/brand-loading.test.mjs`
- Modify: `frontend/src/components/brand/logo.tsx`
- Create: `frontend/src/components/feedback/loading-spinner.tsx`
- Modify: `frontend/src/components/feedback/site-loader.tsx`
- Modify: `frontend/src/app/loading.tsx`
- Modify: `frontend/src/app/globals.css`
- Modify: `frontend/src/components/onboarding/onboarding-form.tsx`
- Modify: `frontend/src/components/auth/auth-form.tsx`
- Add existing asset: `frontend/public/kibereduaz_logo.png`

**Interfaces:**
- Produces: `BRAND_LOGO_SRC = "/kibereduaz_logo.png"`
- Produces: `BrandMark({ size })`, `Logo({ compact })`
- Produces: `LoadingSpinner({ size, label, className })`

- [ ] **Step 1: Write failing logo and loading primitive tests**

Create `frontend/tests/brand-loading.test.mjs`:

```js
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BRAND_LOGO_SRC } from "../src/components/brand/logo.tsx";
import { LoadingSpinner } from "../src/components/feedback/loading-spinner.tsx";

test("brand source points to the supplied public logo", () => {
  assert.equal(BRAND_LOGO_SRC, "/kibereduaz_logo.png");
  assert.equal(existsSync(new URL("../public/kibereduaz_logo.png", import.meta.url)), true);
});

test("loading spinner exposes status text without duplicating visible copy", () => {
  const html = renderToStaticMarkup(createElement(LoadingSpinner, { label: "Yadda saxlanılır" }));
  assert.match(html, /role="status"/);
  assert.match(html, /Yadda saxlanılır/);
});
```

- [ ] **Step 2: Run the tests and verify the expected failure**

Run:

```powershell
cd frontend
npx tsx --experimental-test-module-mocks --test tests/brand-loading.test.mjs
```

Expected: FAIL because the exported logo constant and loading spinner do not exist.

- [ ] **Step 3: Replace the CSS logo and add the shared spinner**

Use Next `Image` with intrinsic `width={2154}` and `height={922}`, responsive CSS dimensions, and the supplied public source. Keep the `Logo` home link and accessible label. `BrandMark` uses the same asset in a constrained container rather than drawing the old “K”. Remove obsolete `.brand-mark__letter`, scan, and status styles.

Create a CSS-animated `LoadingSpinner` that accepts `sm | md | lg`, uses `role="status"`, a visually hidden label, and stops animation under reduced motion.

- [ ] **Step 4: Make site loading event-driven and update route/action loading**

Change `SiteLoader` to leave when `document.readyState === "complete"` or the browser `load` event fires, with only an 8-second safety timeout. It must not enforce a 950ms/1320ms minimum. Update `app/loading.tsx`, auth submit, and onboarding submit to use the shared spinner and `aria-busy`.

- [ ] **Step 5: Verify tests, lint, and build**

Run:

```powershell
cd frontend
npx tsx --experimental-test-module-mocks --test tests/brand-loading.test.mjs
npm run lint
npm run build
```

Expected: tests PASS; no image sizing or accessibility lint warnings; build exits `0`.

- [ ] **Step 6: Commit brand and loading integration**

```powershell
git add frontend/public/kibereduaz_logo.png frontend/src/components/brand/logo.tsx frontend/src/components/feedback/loading-spinner.tsx frontend/src/components/feedback/site-loader.tsx frontend/src/app/loading.tsx frontend/src/app/globals.css frontend/src/components/onboarding/onboarding-form.tsx frontend/src/components/auth/auth-form.tsx frontend/tests/brand-loading.test.mjs
git commit -m "feat(web): apply brand logo and loading states"
```

---

### Task 7: Rebuild the Hero and Content Architecture Sections

**Files:**
- Create: `frontend/tests/landing-redesign.test.mjs`
- Modify: `frontend/src/components/landing/landing-hero.tsx`
- Modify: `frontend/src/components/landing/content-structure.tsx`
- Modify: `frontend/src/app/globals.css`
- Delete if unused: `frontend/public/images/cybersecurity_photo.jpg`

**Interfaces:**
- Produces: `MISSION_STEPS` with `learn`, `practice`, `prove`
- Produces: `CONTENT_LEVELS` in exact `Path`, `Module`, `Room`, `Task`, `Sual` order

- [ ] **Step 1: Write failing structural tests for the redesigned sections**

Create `frontend/tests/landing-redesign.test.mjs`:

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { MISSION_STEPS } from "../src/components/landing/landing-hero.tsx";
import { CONTENT_LEVELS } from "../src/components/landing/content-structure.tsx";

test("hero presents the three-step mission loop", () => {
  assert.deepEqual(MISSION_STEPS.map((step) => step.id), ["learn", "practice", "prove"]);
});

test("hero no longer references the cybersecurity stock photo", async () => {
  const source = await readFile(new URL("../src/components/landing/landing-hero.tsx", import.meta.url), "utf8");
  assert.equal(source.includes("cybersecurity_photo.jpg"), false);
  assert.equal(source.includes("from \"next/image\""), false);
});

test("content architecture keeps five ordered symmetric stages", () => {
  assert.deepEqual(CONTENT_LEVELS.map((level) => level.name), ["Path", "Module", "Room", "Task", "Sual"]);
  assert.equal(CONTENT_LEVELS.length, 5);
});
```

- [ ] **Step 2: Run the redesign tests and verify the expected failure**

Run:

```powershell
cd frontend
npx tsx --experimental-test-module-mocks --test tests/landing-redesign.test.mjs
```

Expected: FAIL because the exported catalogs and image-free hero do not exist.

- [ ] **Step 3: Implement the layered mission-stack hero**

Remove `next/image` and the stock-photo card. Keep the eyebrow, headline, value copy, CTA routes, and link loading indicators. Build three glass mission cards with 01/02/03 labels, progress/terminal/badge details, connecting lines, radial glow, grid, and restrained transform/opacity motion. Do not create a canvas inside the hero; the global Silk canvas remains the background.

- [ ] **Step 4: Implement the symmetric five-stage content architecture**

Center the section intro. Render five equal-width desktop cards over one connector line with `Room` as the stronger center accent. At mobile widths, switch to one-column cards with a vertical connector. Preserve semantic `<ol>` and heading hierarchy.

- [ ] **Step 5: Add responsive and reduced-motion CSS, then remove the unused photo**

Use CSS grid and pseudo-elements for connectors. Add `overflow: clip`, `min-width: 0`, and 320px-safe padding. Under `prefers-reduced-motion`, disable mission float/entrance transforms. Confirm the photo has no remaining references with `rg`; delete only `frontend/public/images/cybersecurity_photo.jpg` when the result is empty.

- [ ] **Step 6: Verify structural tests, lint, and build**

Run:

```powershell
cd frontend
npx tsx --experimental-test-module-mocks --test tests/landing-redesign.test.mjs
rg -n "cybersecurity_photo\.jpg" frontend/src frontend/public
npm run lint
npm run build
```

Expected: redesign tests PASS, `rg` has no matches, lint and build exit `0`.

- [ ] **Step 7: Commit the landing redesign**

```powershell
git add frontend/src/components/landing/landing-hero.tsx frontend/src/components/landing/content-structure.tsx frontend/src/app/globals.css frontend/tests/landing-redesign.test.mjs frontend/public/images/cybersecurity_photo.jpg
git commit -m "feat(web): redesign landing hero and content architecture"
```

---

### Task 8: Remove Raw Error Leaks and Standardize Remaining Async Actions

**Files:**
- Create: `frontend/tests/error-leak-guard.test.mjs`
- Modify: `frontend/src/components/admin/admin-console.tsx`
- Modify: `frontend/src/components/teacher/teacher-console.tsx`
- Modify: `frontend/src/components/profile/profile-editor.tsx`
- Modify: `frontend/src/components/room/lesson-player.tsx`
- Modify: `frontend/src/components/room/local-lesson-player.tsx`
- Modify: `frontend/src/components/auth/auth-form.tsx`
- Modify: `frontend/src/components/auth/sign-out-button.tsx`
- Modify: `frontend/src/components/notifications/notification-center.tsx`

**Interfaces:**
- Consumes: `getDisplayError`, `LoadingSpinner`
- Enforces: learner contexts use `audience: "learner"`; admin/teacher consoles use `audience: "staff"`

- [ ] **Step 1: Write a failing source guard for known raw-error leaks**

Create `frontend/tests/error-leak-guard.test.mjs`:

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const uiFiles = [
  "../src/components/admin/admin-console.tsx",
  "../src/components/teacher/teacher-console.tsx",
  "../src/components/profile/profile-editor.tsx",
  "../src/components/room/lesson-player.tsx",
  "../src/components/auth/auth-form.tsx",
];

test("interactive UI never renders raw caught error messages", async () => {
  for (const relative of uiFiles) {
    const source = await readFile(new URL(relative, import.meta.url), "utf8");
    assert.equal(/cause\s+instanceof\s+Error\s*\?\s*cause\.message/.test(source), false, relative);
    assert.equal(/return\s+message\s*\|\|/.test(source), false, relative);
    assert.equal(/Təsdiq alınmadı:\s*\$\{reason\}/.test(source), false, relative);
  }
});
```

- [ ] **Step 2: Run the leak guard and verify the expected failure**

Run:

```powershell
cd frontend
npx tsx --experimental-test-module-mocks --test tests/error-leak-guard.test.mjs
```

Expected: FAIL on the existing raw `cause.message` and auth fallback patterns.

- [ ] **Step 3: Replace every rendered raw cause with the safe mapping**

Use `getDisplayError(cause, { audience: "staff", context: "admin" | "teacher" })` in staff consoles. Use learner audience in profile, lesson, auth, contact, notification, and room flows. Render staff `reference` on a separate muted line. Map known Supabase auth text to fixed Azerbaijani copy and use a generic fallback; never interpolate callback query text.

- [ ] **Step 4: Audit actual pending actions and apply the shared spinner**

Run:

```powershell
rg -n "pending|loading|submitting|saving|Loader2|animate-spin" frontend/src/components frontend/src/app
```

Replace pending icons in admin, teacher, profile, remote lesson, local lesson, sign-out, and notification actions with `LoadingSpinner`. Each promise-starting button gets `disabled`, `aria-busy`, and a specific pending label. Wrap notification `markAllRead` in `try/catch`, restore its previous state on failure, and show learner-safe recovery copy. Keep page skeletons for data fetch and link indicator for navigation. Do not add an overlay to actions already represented by a button spinner.

- [ ] **Step 5: Verify the leak guard and all frontend checks**

Run:

```powershell
cd frontend
npm test
npm run lint
npm run build
```

Expected: leak guard and all regression tests PASS; lint and build exit `0`.

- [ ] **Step 6: Commit the UI safety audit**

```powershell
git add frontend/src/components/admin/admin-console.tsx frontend/src/components/teacher/teacher-console.tsx frontend/src/components/profile/profile-editor.tsx frontend/src/components/room/lesson-player.tsx frontend/src/components/room/local-lesson-player.tsx frontend/src/components/auth/auth-form.tsx frontend/src/components/auth/sign-out-button.tsx frontend/src/components/notifications/notification-center.tsx frontend/tests/error-leak-guard.test.mjs
git commit -m "fix(web): hide technical errors and unify pending actions"
```

---

### Task 9: End-to-End Verification and Visual QA

**Files:**
- Modify only when a failing test or visual defect requires a focused fix: files changed in Tasks 1–8

**Interfaces:**
- Verifies the complete spec; produces no new product API

- [ ] **Step 1: Run the full backend verification from a clean process**

```powershell
cd backend
npm run prisma:generate
npm test
npm run build
```

Expected: every command exits `0` without test warnings.

- [ ] **Step 2: Run the full frontend verification**

```powershell
cd frontend
npm test
npm run lint
npm run build
```

Expected: every command exits `0`; Next.js reports successful static/dynamic route generation.

- [ ] **Step 3: Inspect repository safety and unintended changes**

```powershell
git diff --check
git status --short
rg -n "Prisma|SELECT \*|cause\.message|Təsdiq alınmadı:" frontend/src
```

Expected: no whitespace errors; status contains only intended files; learner-rendered code has no raw technical messages.

- [ ] **Step 4: Start both applications and perform browser QA**

Run backend and frontend dev servers in separate terminals. In the in-app browser inspect desktop and 320px mobile views for `/`, `/login`, `/onboarding`, `/dashboard`, `/teacher`, and `/admin`. Verify:

```text
Logo: header/footer/auth/loader use kibereduaz_logo.png.
Hero: no stock photo; three layered mission cards remain readable and do not overflow.
Architecture: five equal desktop cards and one vertical mobile timeline.
Onboarding: four required questions, conditional Other text, pending state, safe retry error.
Routing: incomplete profiles cannot open protected routes; completed profiles cannot reopen onboarding.
Errors: learner sees recovery copy only; staff sees status/request ID; no stack or Prisma detail.
Motion: reduced-motion mode removes floating/entrance animation.
```

- [ ] **Step 5: Run a focused regression cycle for any discovered defect**

For each defect, first add or extend the smallest relevant test, run it to observe the failure, implement only the fix, and rerun that test plus the full affected package checks.

- [ ] **Step 6: Request code review and apply only verified findings**

Use `superpowers:requesting-code-review` against the spec and current diff. For every valid finding, reproduce it with a failing test before changing production code, then rerun full verification.

- [ ] **Step 7: Confirm the verification step produced no uncommitted fix**

Run `git status --short`. Expected: only the previously known Silk-background working-tree changes remain, or the tree is clean if they were checkpointed before plan execution. If Step 5 exposed a defect, return to its owning task, add the failing regression there, and complete that task's explicit verification and commit steps before repeating Task 9.
