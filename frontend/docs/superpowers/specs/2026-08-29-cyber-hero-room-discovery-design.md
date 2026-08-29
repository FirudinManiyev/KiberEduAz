# KiberEduAz Cyber Hero and Room Discovery Design

## Goal

Refresh the landing, student dashboard, and teacher dashboard heroes with `cyber_background.jpg`; give every room context-aware artwork from `public/images`; and keep long room-like lists compact with an eight-item progressive disclosure control.

## Constraints

- All implementation and documentation changes stay inside `frontend/`.
- The supplied `/images/cyber_background.jpg` is the hero background on the landing, student, and teacher pages.
- Existing authentication, API mutations, room progress, and role redirects keep their current behavior.
- Long learning sequences remain ordered; filtering a room list resets it to the first eight results.
- Controls remain keyboard accessible, responsive to 320 px, and respectful of reduced motion.

## Hero Composition

A shared `CyberHeroShell` owns the full-bleed Next.js image and decorative layers. It renders the image at the back, then a dark directional gradient for text contrast, subtle red and emerald radial light, the existing cyber grid, a scan layer, and finally page-specific content.

- Landing: marketing copy and calls to action on the left; a glass mission-status panel on the right. The old standalone cybersecurity photo is removed so the new background remains the visual focus.
- Student dashboard: personalized mission copy and stats on the left; the existing command console becomes the raised glass foreground layer on the right.
- Teacher dashboard: greeting and teacher actions on the left; class, draft-room, and published-room totals become a compact glass metric strip in the hero.

Decorative layers are pointer-inert and hidden from assistive technology. Text and actions remain real foreground content.

## Semantic Room Artwork

`resolveRoomArtwork` receives a room slug, title, and category. Exact topic rules select the supplied imagery first, then track fallbacks handle new teacher-created rooms:

- Pentesting, recon, exploitation, and Red Team: `pentest_photo.jpg` or `red_team.jpg`.
- Kali/Linux: `linux_photo.jpg`.
- HTTP/HTTPS: `http_photo.jpg`.
- Authentication: `authentication.jpg`.
- SQL injection: `sql_photo.jpg`.
- Blue Team: `blue_team.webp`.
- SOC/log analysis: `soc_photo.jpg`.
- GRC/risk/compliance: `grc_photo.jpg`.

Explicit catalogue art remains valid, but the resolver is the presentation boundary for API summaries, API details, and raw dashboard room cards. This prevents generic computer artwork from returning for a recognizable topic.

## Progressive Disclosure

A focused client hook returns the visible slice, expanded state, and toggle action. The default count is eight. The control only appears when more items exist and alternates between “Daha çox göstər” and “Daha az göstər”.

- Room catalogue: applies after search and category filtering; query/filter changes collapse to eight.
- Student dashboard learning path: keeps room order and reveals the remaining stages on demand.
- Teacher dashboard: applies independently to room, class, and selected-class student lists; selecting another class collapses its student list.

The featured four-room student section remains intentionally curated and retains its existing “Hamısına bax” link. Lesson/task lists are not limited because hiding required learning steps would damage the learning flow.

## Testing and Verification

- Unit tests cover topic artwork, category fallbacks, existing assets, eight-item slicing, expansion, and short-list behavior.
- Existing catalogue tests verify every resolved image exists under `public/images`.
- Final checks run `npm test`, `npm run lint`, `npx tsc --noEmit`, and `npm run build` from `frontend/`.
- Route smoke checks cover `/`, `/rooms`, and available authenticated page responses without changing backend state.

