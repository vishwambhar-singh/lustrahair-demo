# LustraHair Virtual Try-On

An editorial beauty-commerce experience that lets shoppers preview hairstyles and colours before buying.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/lustrahair run dev` — run the LustraHair frontend
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- No database or secrets are required for the LustraHair prototype fallback.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/lustrahair/src/App.tsx` — interactive landing page and try-on studio
- `artifacts/lustrahair/src/index.css` — LustraHair theme, typography, motion, and global styles
- `artifacts/lustrahair/README.md` — setup, AI adapter notes, limitations, and production roadmap
- `artifacts/api-server/src/routes/try-on.ts` — validated `/api/try-on` simulation endpoint
- `lib/api-spec/openapi.yaml` — source-of-truth API contract

## Architecture decisions

- The first release is local-state only so the full shopper journey works without account, database, or provider setup.
- The try-on route keeps a stable provider-neutral contract; the fallback is explicitly labelled a simulation rather than photorealistic AI.
- Uploaded and generated image bytes are not persisted; production storage, consent, deletion, moderation, and queueing are documented as roadmap items.
- The frontend uses the generated API client so a real image-to-image provider can be introduced behind one server boundary.

## Product

LustraHair helps a shopper move from inspiration to confident purchase: choose a photo or demo, select from six hairstyles and four colours, generate a preview, compare before/after, save/share the look, and take a commerce action.

## User preferences

- The user requested an original premium light-theme beauty experience, not a clone of an existing hair brand.

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
