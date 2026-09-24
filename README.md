# Mojo

React + Next.js interactive UTBK prototype. Run `npm install`, then `npm run dev`.

## Extending the skill tree

All subjects use `app/skill-map.tsx`. Edit `data/skill-tree.json`, which contains `subjects` and `nodes`. Add a node with a unique, stable `id`, its existing `parentId`, `subject`, `name`, `icon`, `mastery`, and `description`. The root has `kind: "root"` and no parent; subject categories have `kind: "category"`; ordinary skills omit `kind`. `lib/skill-tree.ts` imports this JSON for the map and subject filters. Do not add coordinates or connector paths. The renderer derives positions and edges from the parent relationships and recalculates subtree widths and canvas height automatically.

`mastery` uses a 0–100 scale and currently contains demonstration values, not individual user records. Keep real user progress separate and associate it with these stable skill IDs when connecting personalization. JSON changes are included on the next build.

Each node has one parent. To add a new subject, add its name to `subjects` and a category node under `mojo`, then add its skills. All subject views, including the overview, start fully expanded. The −/+ controls optionally collapse and expand branches. Search includes matching nodes and their ancestors even within collapsed branches. All views support zoom, fit-to-view, scroll, and mouse dragging; mobile supports touch scrolling.

Layout checks: `node --test tests/skill-tree.test.mjs` (Node 22.18+). Tests cover all subjects, collapse/search, 180 added nodes, a 250-level chain, bounds, overlap, duplicate IDs, and cycles.

`npm run build` creates a static export in `out`. AI replies, progress, and practice questions are demonstration data, not connected to a backend.

## Mock drills

The `/drill` catalog starts with subject cards from `data/skill-tree.json`. SNBT is selected; Semua and Populer are disabled. Each subject links to its own searchable page at `/drill/subject/[id]`. Database drills are matched by `skillId`, so older subject labels do not affect grouping. Skills without questions remain visible with an availability message.

Selecting an individual skill or the overall subject test shows three modes: Latihan Santai (`quick`), Latihan Dalam (`deep`), and Latihan Kelemahan (`focus`). Deep and focus combine matching question sets and deduplicate question IDs. Sessions open at `/drill/subject/[id]/[mode]`, with an optional `skill` query parameter. Unavailable modes cannot be started. Focus mode uses existing focus sets, not personalized weakness scores. Combined sessions do not save attempts or profile progress.

Latihan Santai generates questions on demand using `lib/relaxed-questions.ts`, with no timer, question limit, or automatic completion. It currently supports all six quantitative skills. Subject-wide practice rotates through those skills; a selected skill stays in that scope. Templates compute the correct answer, distractors, and explanation together. Variations can recur over time. Other subjects remain unavailable until authored generators are added. Existing quick drill links for supported skills also open this experience.

Users end relaxed sessions with “Akhiri sesi”. Only checked answers count toward the summary. Session memory keeps cumulative totals and the latest 20 checked questions for review, so long sessions do not retain unlimited question history. Refresh starts a new session; results are not persisted to the profile. Generator checks run with `node --test tests/relaxed-questions.test.mjs`.

Edit `data/drills.json` to add or change drills. The catalog at `/drill` and each session at `/drill/[id]` read this file. Each drill needs a unique URL-safe `id`, title, description, mode, color, skillId, subject, topic, minutes, xp, and a nonempty questions array. Questions contain an id, text, answers, a zero-based `correct` answer index, and an explanation. For example, `correct: 1` marks option B as correct. Each question ID must be unique within its drill.

The page stores choices only for the current session. Refreshing resets it. Edit the JSON and rebuild to add new static drill URLs to the hosted mockup; no API or database is needed.

## Exploration camera

Every subject retains the shared `Me` root above its category. The camera starts at that root with a readable automatic zoom (60–85%, based on viewport and graph dimensions), rather than fitting every node into the viewport. Node selection centers the destination and highlights its ancestor path. Zoom preserves the current viewing area. Separate controls return to Me or fit the whole map; branches still start expanded.
