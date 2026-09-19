# Mojo

React + Next.js interactive UTBK prototype. Run `npm install`, then `npm run dev`.

## Extending the skill tree

All subjects use `app/skill-map.tsx`. Add a record to `skillNodes` in `lib/skill-tree.ts` with a unique `id`, its existing `parentId`, `subject`, `name`, `icon`, `mastery`, and `description`. Do not add coordinates or connector paths. The renderer derives positions and edges from the parent relationships and recalculates subtree widths and canvas height automatically.

Each node has one parent. To add a new subject, add its name to `subjects` and a category node under `mojo`, then add its skills. The overview starts with foundation branches collapsed; the + controls expand them. Search includes matching nodes and their ancestors even within collapsed branches. All views support zoom, fit-to-view, scroll, and mouse dragging; mobile supports touch scrolling.

Layout checks: `node --test tests/skill-tree.test.mjs` (Node 22.18+). Tests cover all subjects, collapse/search, 180 added nodes, a 250-level chain, bounds, overlap, duplicate IDs, and cycles.

`npm run build` creates a static export in `out`. AI replies, progress, and practice questions are demonstration data, not connected to a backend.
