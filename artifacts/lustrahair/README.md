# LustraHair Virtual Try-On

A customer-facing light-theme try-on for the fictional brand **LustraHair**. The shopper journey is:

Discover → Upload photo → Choose look & colour → Generate preview → Compare before/after → Product action

## Why this exists

Online hair shoppers cannot tell how a wig, topper, or clip-in will sit on their face. This prototype reduces that uncertainty so they can choose a silhouette and colour with more confidence, then add to bag or request a consultation.

## Features

- Premium light-theme landing page and mobile menu
- Upload (JPG / PNG / WEBP, 10MB) with drag-and-drop, replace/remove, and invalid-file toasts
- One-click demo portrait so reviewers can evaluate without uploading
- Six silhouettes and four colours (Black, Dark Brown, Chestnut, Honey Blonde)
- Identity-preserving preview: face stays the original photo; hair is photographed strand texture, not a flat colour film
- Live colour change on the result, keeping highlights and shadows
- Before/after slider, save look, share, add to bag, request consultation, try another look

## Tech stack

- React 19 + TypeScript + Vite 7
- Tailwind CSS 4
- Wouter, TanStack Query, generated OpenAPI client
- Express 5 API with Zod validation (`POST /api/try-on`)

## AI / image approach

This assignment does not require training a model. The 18-hour trade-off is a **two-layer preview** that keeps identity on-device:

1. **Demo portrait (the path reviewers will use first)**  
   Identity-preserving AI image edits of the same woman were generated per silhouette (waves, sleek, curls, bob, layers, bangs). The result canvas shows that photographic hair on the original lighting, then **recolours only hair pixels** while protecting skin, lips, teeth, and the red knit. That is why colour changes look like dye, not a brown overlay.

2. **Any uploaded photo**  
   Photographed hair overlays (transparent strand maps) are aligned to the head, the face opening is punched out so eyes and identity remain, and the same luminosity-preserving dye is applied.

3. **API contract**  
   `POST /api/try-on` validates `imageData`, `style`, `color`, and `gender`. Today it returns `mode: "simulation"` so a production image-to-image provider (Gemini / Flux / a virtual-try-on API) can be swapped in behind the same schema without changing the UI.

This is deliberately not a cartoon SVG mask. It is also not a live GPU model in the browser. The README is honest about that so the product can grow into a queued provider without misleading shoppers.

## Run locally

From the inner workspace (`LustraHair-Virtual-Try-On/`):

```bash
pnpm install --ignore-scripts
```

On Windows, `PORT` and `BASE_PATH` are required by Vite:

```powershell
$env:PORT="5000"; $env:NODE_ENV="development"; pnpm --filter @workspace/api-server run build
$env:PORT="5000"; $env:NODE_ENV="development"; pnpm --filter @workspace/api-server run start

$env:PORT="5173"; $env:BASE_PATH="/"; pnpm --filter @workspace/lustrahair run dev
```

Open http://localhost:5173/

Use **Use our demo photo instead**, pick a look and colour, then **Generate preview**. Drag the slider and switch colours on the result.

## Key technical decisions

- Keep face pixels from the shopper photo; never cover the face with a solid shape.
- Recolour hair with luminance (highlights stay highlights).
- Validate try-on input on the server even when generation is client-side, so a provider can drop in later.
- Small catalogue, polished journey — not a fake checkout or admin dashboard.

## Known limitations

- Uploaded photos use hair overlays rather than a full inpainting model, so unusual poses may misalign.
- Demo commerce actions do not create real orders.
- Images stay in browser memory for the session.
- Production should add moderation, consent, short-lived storage, queues, and a real image-to-image provider.

## Production next steps

1. Provider adapter in `artifacts/api-server/src/routes/try-on.ts` using a secret API key.
2. Return `mode: "provider"` only after a successful generation.
3. Consent, deletion, encryption, and moderation.
4. Queue + progress events for 10–30s generations.
5. Real catalogue, inventory, and checkout.

## Deploy

```bash
pnpm --filter @workspace/lustrahair run build
```
