# KiberEduAz Content and Experience Refresh Design

## Goal

Expand the frontend-only MVP from two API-backed rooms into a seven-room cyber-learning experience, integrate the supplied image library, add an Azerbaijani FAQ and global sign-out access, improve transition feedback, and make the animated background safe and responsive on mobile devices.

## Constraints

- All source changes stay inside `frontend/`; backend source, migrations, seed data, and environment files are out of scope.
- The two existing API-backed rooms keep their server-backed answer and progress behavior.
- The five newly supplied Markdown rooms use frontend-local progress because their content cannot be added to the backend in this scope.
- The new English GRC lesson bodies remain in English. Azerbaijani is used for room metadata, task navigation, helper copy, loading states, filters, and all FAQ content.
- Existing black/dark-gray, red, and green visual language remains the design foundation.
- The implementation must preserve accessibility, reduced-motion behavior, and layouts down to a 320 px viewport.

## Content Architecture

### Hybrid room catalogue

The room catalogue contains seven rooms from two sources:

| Track | Slug | Source | Progress mode |
|---|---|---|---|
| Red Team | `intro-to-pentesting` | Existing API room | Backend |
| GRC | `grc-foundations` | Existing API room | Backend |
| GRC | `grc-roles-three-lines` | `GRC_Roles_and_Three_Lines_Model (1).md` | Browser-local |
| GRC | `grc-frameworks-landscape` | `GRC_Frameworks_Landscape.md` | Browser-local |
| GRC | `risk-identification` | `Risk_Identification.md` | Browser-local |
| Blue Team | `introduction-to-blue-team` | `introduction-to-blue-team.md` | Browser-local |
| Blue Team | `soc-windows-event-logs-sysmon` | `soc-analysis-windows-event-logs-sysmon.md` | Browser-local |

`src/lib/content/catalog.ts` will be the single metadata registry for the five local rooms. Each entry will provide Azerbaijani card copy, slug, track, difficulty, duration, points, image, objectives, source filename, and task grouping rules. Existing API rooms are merged with local summaries at the page boundary, so backend data remains authoritative for the original rooms.

`src/lib/content/markdown.ts` will be server-only. It will load UTF-8 Markdown from `src/data`, split content by configured heading boundaries, and return serializable task sections. This avoids copying long lesson bodies into TypeScript while still normalizing inconsistent source structures. The Blue Team files already use `## Task` headings. GRC files will use curated heading groups from the registry so their broad chapters become five focused tasks instead of dozens of tiny steps.

Local content will use a discriminated `LocalRoomDetail` type shaped like the existing `RoomDetail` contract. The UI receives a common room presentation model, while the progress controller is selected by `progressMode: "api" | "local"`. API answer keys remain server-only. Local self-check data may be evaluated in the browser because it is explicitly an offline/static MVP path.

### Local progress

Local progress is stored under the versioned key `kibereduaz:room-progress:v1`. The value records completed task IDs, solved local question IDs, earned local XP, and the last visited task for each local room. It does not claim to be account-synced. The room UI will label it as “Bu cihazda saxlanılır.”

Blue Team and SOC questions will use their existing short-answer, true/false, and scenario prompts. GRC review questions will be presented as reflection checks with a concise model-answer panel and an explicit “Anladım, davam et” completion action. Both paths retain the current lesson sidebar, numbered tasks, progress bar, status cards, and next/previous task flow.

If the API is temporarily unavailable, the rooms catalogue still renders the five local rooms and shows a compact notice that account-synced rooms could not be loaded. A malformed local Markdown file is a development/build error covered by tests rather than silently producing an empty lesson.

## Image Usage

All supplied images are served through `next/image` with explicit aspect ratios, `sizes`, lazy loading below the fold, and gradient overlays that fit the dark theme.

- `cybersecurity_photo.jpg`: landing hero visual and security-platform feature art.
- `cyber_class_photo.jpg`: Blue Team track banner and classroom/platform section.
- `hacker_photo2.jpg`: Red Team and pentesting cards.
- `database_photo.jpg`: SOC/log-analysis card and data-analysis accents.
- `cybershield_photo.png`: GRC foundations and safety card.
- `computer_photo.png`: general learning and frameworks card.
- `teacher_profile_photo.png`: teacher profile/avatar presentation.
- `userprofile.jpg`: student/default profile presentation.

White-background illustrations will sit inside dark framed cards with an inner neutral surface and overlay, not be stretched as full-bleed photography. Photos will use `object-cover`; illustrations will use `object-contain`.

## Page and Component Design

### Landing page

The hero gains a responsive editorial image panel with layered red/green accents, small live-status chips, and a stronger connection to the room catalogue. A second image-supported section will show classroom/SOC learning context. Images must not replace the Acid Squares background; they sit above it in contained cards.

### Rooms catalogue and room detail

Room cards gain an image header, track badge, local/API progress badge, task count, difficulty, and hover movement. Filters expand to Red Team, Blue Team, and GRC. The catalogue merges API and local summaries without duplicate slugs.

Room detail keeps the existing two-column hero and lesson player. The hero adds the mapped room art. The large `LessonPlayer` will be decomposed into a shared presentation component plus API and local progress controllers so markup, responsive behavior, and interaction states are not duplicated.

### Roadmap

The roadmap becomes three tracks:

- Red Team: Intro to Pentesting, followed by locked discovery/web-security stages.
- Blue Team: Introduction to Blue Team and SOC Analysis available, followed by locked incident-response stages.
- GRC: GRC Foundations, Three Lines, Framework Landscape, and Risk Identification available.

Counts and links come from the same content catalogue used by `/rooms`. Desktop uses three track cards; mobile uses a single-column sequence with horizontal task chips only where they fit without page overflow. The summary shows seven rooms and the correct per-track availability instead of the current hard-coded two-room values.

### FAQ

`/faq` is a backend-free Azerbaijani page with four categories: platform, hesab və giriş, Room/progress, and müəllim/təhlükəsizlik. It includes a compact hero, category filters, client-side search, animated accessible disclosure cards, an empty-search state, and a contact CTA. FAQ links appear in desktop navigation where space allows, the mobile menu, and the footer.

### Sign out

When `SiteHeader` receives a user, desktop and mobile navigation show an explicit sign-out control that posts to the existing `/auth/signout` route. A focused `SignOutButton` client component uses `useFormStatus` to disable repeat submissions and switch its label to “Hesabdan çıxılır…”. Profile and pending pages continue to use the same control rather than maintaining separate sign-out markup.

### Loading and transition feedback

- Route loading skeletons include short Azerbaijani messages such as “Səhifə hazırlanır…” and context-neutral progress hints.
- Link pending indicators gain accessible status text without changing surrounding layout.
- Login/register buttons replace their label while pending: “Giriş yoxlanılır…”, “Hesab yaradılır…”, or “Müraciət göndərilir…”.
- Local answer checks show “Cavab yoxlanılır…”. API answer behavior keeps its current server request and error handling.
- The initial loader remains but uses Azerbaijani support copy and respects reduced motion.

## Responsive Background Fix

The current fixed background uses a child at `inset: -4%` and `108%` width/height while applying the same WebGL cost on all devices. The refresh will:

- constrain the global layer to `inset: 0`, `width: 100%`, `max-width: 100vw`, and safe viewport height;
- use containment and clipping so the canvas cannot enlarge the document viewport;
- derive an Acid Squares render profile from viewport width, pointer capability, reduced-motion, and device-pixel ratio;
- use low steps, DPR 1, no pointer interaction, and no blur render targets on narrow/coarse-pointer devices;
- stop continuous animation for reduced-motion users and render a deterministic frame;
- retain a CSS red/green gradient fallback when WebGL is unavailable;
- audit large grids, card min-widths, long Markdown tables/code blocks, and mobile navigation for horizontal overflow.

Markdown tables and code samples will live in independently scrollable containers, never force the entire page wider than the viewport.

## Error Handling

- Local storage reads are schema/version checked and fall back to empty progress when unavailable or corrupt.
- Missing local room slugs return the existing not-found page.
- API failures do not hide local catalogue content.
- Image containers keep a dark fallback background if an asset fails.
- Search and filter states always provide an explanatory empty state.
- Sign-out uses the existing route redirect and prevents duplicate submissions while pending.

## Testing Strategy

Node tests run through the existing `tsx` test script.

- Catalogue tests assert exactly seven unique merged slugs, five local rooms, non-empty task groups, valid image paths, and Azerbaijani metadata.
- Markdown adapter tests exercise a Blue Team task file and a GRC heading-group file, including tables, code blocks, questions, and UTF-8 Azerbaijani characters.
- Local progress reducer tests cover completion, reload restoration, version mismatch, and corrupt storage fallback.
- Roadmap-model tests assert three tracks and that all seven room links are represented once.
- Header/navigation tests cover signed-out state, signed-in sign-out availability, FAQ presence, and mobile navigation data.
- Acid Squares render-profile tests assert the low-cost mobile/reduced-motion modes.
- Existing signed-in landing-page redirect regression remains green.
- Final verification runs `npm test`, `npm run lint`, `npx tsc --noEmit`, and `npm run build`, followed by route smoke checks for `/`, `/rooms`, every local room, `/roadmap`, and `/faq`.

Visual QA targets 320, 390, 768, 1024, and 1440 px widths. It checks horizontal overflow, background containment, header/mobile menu, image crops, Markdown tables/code blocks, FAQ disclosures, lesson task navigation, and visible loading/sign-out states.

## Acceptance Criteria

- Seven rooms are discoverable with no duplicate cards, and all five new Markdown sources open as structured lessons.
- Original API rooms still use server progress; new rooms clearly use device-local progress.
- All supplied images appear in contextually appropriate locations without layout shift or distortion.
- `/faq` is fully Azerbaijani, searchable/filterable, responsive, and linked globally.
- Signed-in users can sign out from both desktop and mobile navigation with visible pending feedback.
- Roadmap content matches the seven-room, three-track catalogue.
- Navigation, auth, answer checking, and route changes expose concise Azerbaijani loading feedback.
- The animated background does not create horizontal overflow and uses a low-cost mobile/reduced-motion mode.
- No backend files are modified.
