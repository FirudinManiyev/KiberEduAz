# SECURITY CODE AUDIT REPORT: KiberEduAz Backend

An in-depth, targeted Security Code Audit of the **KiberEduAz** codebase was conducted, focusing **EXCLUSIVELY** on Authentication, Authorization, and Access Control mechanisms. 

The audit reviewed middleware, Guards, Decorators, Session/JWT handling via Supabase, and Controller/Service business logic across the backend services.

---

## 1. Executive Summary of Findings

Overall, the codebase utilizes a strong **default-secure architectural model** by:
1. Enabling `JwtAuthGuard` and `RolesGuard` as global Guards in `AppModule`. Every route is protected by default and requires authorization unless decorated explicitly with `@Public()`.
2. Validating JWT signatures using asymmetric keys (via JWKS) or legacy HMAC secrets through the `jose` library, and immediately resolving the user profile from the database (`profile.role`) rather than trusting user-controlled metadata within the JWT.

However, several **High-Severity Broken Access Control (BAC) and Insecure Direct Object References (IDOR)** vulnerabilities were discovered in the resource management controllers (`RoomsController` and `PathsController`). Specifically, there is no ownership validation for content authors (`TEACHER` role), allowing any approved teacher to modify, corrupt, or delete rooms, tasks, questions, modules, and paths created by other teachers or administrators.

---

## 2. Vulnerability Breakdown

### Finding 1: Insecure Direct Object Reference (IDOR) & Broken Access Control (BAC) in Room Updates
- **Vulnerable File Path & Line Numbers**: `backend/src/catalog/rooms.service.ts` (Lines 180–195), `backend/src/catalog/rooms.controller.ts` (Lines 47–55)
- **Severity Level**: **High**
- **Vulnerability Explanation & Exploitation Scenario**:
  The `PATCH /rooms/:id` endpoint is restricted to roles `TEACHER` and `ADMIN` via `@Roles(UserRole.TEACHER, UserRole.ADMIN)`. However, when a `TEACHER` updates a room, the service performs no verification to ensure that the room's `createdById` matches the requesting user's `id`. 
  
  **Exploitation Scenario**: An attacker registered as an approved `TEACHER` can capture a legitimate update request, replace the UUID in the `:id` parameter with the UUID of a room created by an `ADMIN` or another `TEACHER`, and rewrite its metadata, title, description, or content configuration.

- **Secure Patch / Fix Code Snippet**:
  Add an ownership check inside the service method before updating:
  ```typescript
  // In backend/src/catalog/rooms.service.ts
  async update(user: AuthenticatedUser, id: string, dto: Partial<UpsertRoomDto>) {
    const existingRoom = await this.prisma.room.findUnique({
      where: { id },
      select: { createdById: true },
    });

    if (!existingRoom) {
      throw new NotFoundException('Room tapılmadı');
    }

    // Ensure TEACHER can only modify their own rooms
    if (user.profile.role === UserRole.TEACHER && existingRoom.createdById !== user.id) {
      throw new ForbiddenException('Bu otağı redaktə etmək üçün icazəniz yoxdur');
    }

    if (dto.moduleId) {
      await this.assertModuleExists(dto.moduleId);
    }

    const safeDto =
      user.profile.role === UserRole.ADMIN ? dto : { ...dto, status: undefined };

    const room = await this.prisma.room.update({
      where: { id },
      data: this.roomData(safeDto),
      include: CONTENT_INCLUDE,
    });

    return toRoomDetailForAuthor(room);
  }
  ```

---

### Finding 2: Missing Ownership Checks (IDOR) in Task & Question Management
- **Vulnerable File Path & Line Numbers**: `backend/src/catalog/rooms.service.ts` (Lines 214–265), `backend/src/catalog/rooms.controller.ts` (Lines 77–98)
- **Severity Level**: **High**
- **Vulnerability Explanation & Exploitation Scenario**:
  Task creation, updating, and deletion (endpoints `POST /rooms/:id/tasks`, `PATCH /rooms/:id/tasks/:taskId`, and `DELETE /rooms/:id/tasks/:taskId`) are protected by the `@Roles(UserRole.TEACHER, UserRole.ADMIN)` decorator. However, `RoomsService.upsertTask` and `RoomsService.removeTask` do not check if the requesting user owns the underlying `Room`.
  
  **Exploitation Scenario**: A malicious `TEACHER` can send an HTTP POST request to `/api/v1/rooms/<TARGET_ROOM_UUID>/tasks` with a crafted payload containing arbitrary questions and reading sections, altering the learning flow and grades of students enrolled in any high-value course.

- **Secure Patch / Fix Code Snippet**:
  Modify the controller endpoints to pass the `user` context, and validate ownership in the service:
  ```typescript
  // In backend/src/catalog/rooms.controller.ts
  @Post(':id/tasks')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  createTask(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() dto: UpsertTaskDto
  ) {
    return this.roomsService.upsertTask(user, id, dto);
  }

  @Patch(':id/tasks/:taskId')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  updateTask(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() dto: UpsertTaskDto,
  ) {
    return this.roomsService.upsertTask(user, id, dto, taskId);
  }

  @Delete(':id/tasks/:taskId')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  removeTask(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('taskId', ParseUUIDPipe) taskId: string
  ) {
    return this.roomsService.removeTask(user, id, taskId);
  }
  ```
  ```typescript
  // In backend/src/catalog/rooms.service.ts
  async upsertTask(user: AuthenticatedUser, roomId: string, dto: UpsertTaskDto, taskId?: string) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      select: { id: true, createdById: true, _count: { select: { tasks: true } } },
    });

    if (!room) {
      throw new NotFoundException('Room tapılmadı');
    }

    if (user.profile.role === UserRole.TEACHER && room.createdById !== user.id) {
      throw new ForbiddenException('Bu otaq üçün tapşırıqları idarə etməyə icazəniz yoxdur');
    }
    // ... rest of the original upsertTask code ...
  }

  async removeTask(user: AuthenticatedUser, roomId: string, taskId: string): Promise<void> {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      select: { id: true, createdById: true },
    });

    if (!room) {
      throw new NotFoundException('Room tapılmadı');
    }

    if (user.profile.role === UserRole.TEACHER && room.createdById !== user.id) {
      throw new ForbiddenException('Bu otaqdan tapşırıq silməyə icazəniz yoxdur');
    }

    await this.prisma.task.delete({ where: { id: taskId } });
  }
  ```

---

### Finding 3: Insecure Path and Module Authoring Permissions (BAC)
- **Vulnerable File Path & Line Numbers**: `backend/src/catalog/paths.controller.ts` (Lines 28–38, 52–62), `backend/src/catalog/paths.service.ts` (Lines 77–85, 91–103)
- **Severity Level**: **High**
- **Vulnerability Explanation & Exploitation Scenario**:
  Paths (tracks/curriculums) and Learning Modules are core, global structure entities. The controller endpoints for creating and updating paths or modules allow anyone with the `UserRole.TEACHER` role to modify them. Furthermore, there are no checks ensuring that a teacher only modifies paths/modules they created. 
  
  **Exploitation Scenario**: Any approved teacher can send a `PATCH /modules/:id` request to alter a module's slug, title, or status, or link it to a different path, which could disrupt the global curriculum of other institutions.

- **Secure Patch / Fix Code Snippet**:
  Restrict Path and Module creation/modification entirely to `UserRole.ADMIN`, or enforce strict creator-ownership validations:
  ```typescript
  // In backend/src/catalog/paths.controller.ts
  // Change Roles to ADMIN only, as paths and modules are high-level curriculum assets:
  @Post()
  @Roles(UserRole.ADMIN)
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpsertPathDto) {
    return this.pathsService.createPath(user, dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpsertPathDto) {
    return this.pathsService.updatePath(id, dto);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() dto: UpsertModuleDto) {
    return this.pathsService.createModule(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpsertModuleDto) {
    return this.pathsService.updateModule(id, dto);
  }
  ```

---

## 3. Secure Files & Routes Review List

The following files and routes were reviewed and confirmed to follow strict secure coding practices:

- **Authentication Guard (`backend/src/auth/jwt-auth.guard.ts`)**: 
  - Resolves profile identity dynamically from the local database (`PrismaService.profile.findUnique`) rather than trusting user-modifiable claims.
- **Authorization Guard (`backend/src/auth/roles.guard.ts`)**:
  - Implements role check on custom endpoints.
  - Correctly verifies that teachers have an `ACTIVE` status before executing sensitive logic.
- **Supabase Token Verification (`backend/src/auth/supabase-token.service.ts`)**:
  - Uses standard, peer-reviewed `jose` library functions to cryptographically verify RS256/HS256 JWT signatures.
- **Admin Module (`backend/src/admin/admin.controller.ts`)**:
  - Securely locked down to `UserRole.ADMIN` at the controller class level.
- **Class Group Access Control (`backend/src/classes/classes.service.ts`)**:
  - Securely implements `assertCanManage` which ensures that a teacher can only manage their own classes (i.e., `group.teacherId === user.id`).
- **Profile Updates (`backend/src/profiles/profiles.controller.ts`)**:
  - Users can only edit their own profiles (`profilesService.update(user, dto)` via `where: { id: user.id }`).
  - Utilizes NestJS `ValidationPipe` with `whitelist: true` and `forbidNonWhitelisted: true` to prevent mass-assignment/parameter-pollution attacks on protected fields like `role` or `accountStatus`.
- **Progress Submission (`backend/src/progress/progress.service.ts`)**:
  - Points ledger entries are securely bound to `user.id` resolved directly from the verified request context, preventing point spoofing/IDOR on other users' progress.
- **Leaderboards & Notifications (`backend/src/leaderboard/` and `backend/src/notifications/`)**:
  - Bound securely to authenticated caller IDs. No parameter tampering is possible.
