# LustraHair Virtual Try-On

LustraHair is a responsive, premium beauty-commerce prototype that lets a shopper upload a photo, choose a hairstyle and colour, preview the result, compare it with the original, and take the next commerce action.

## Features

- Editorial light-theme landing page with a responsive mobile menu
- Three-step try-on studio: upload, choose, preview
- Drag-and-drop and file-picker upload for JPG, JPEG, PNG, and WEBP files up to 10 MB
- Demo photo mode for evaluator-friendly, no-setup exploration
- Male/female presentation choice that changes the hairline, volume, taper, length, and strand overlay
- Six looks and four colour choices with selected-look summary
- Staged processing state and honest `Preview simulation` labelling
- Before/after comparison slider on every viewport
- Save to browser localStorage, Web Share API support, and clipboard fallback
- Dynamic product card with INR pricing, benefits, add-to-bag feedback, and colour-match feedback
- Accessible labels, keyboard-friendly controls, visible focus states, error toasts, and responsive layouts

## Tech stack

- React + TypeScript + Vite
- Tailwind CSS
- Lucide React icons
- Wouter for the lightweight route shell
- TanStack Query and the generated API client
- Express API server with OpenAPI-generated Zod validation
- Local state only; no database or secrets are required for the prototype

## Run locally

From the workspace root:

```bash
pnpm install
```

Run the API and frontend using the configured Replit workflows, or locally with the environment variables supplied by the artifact workflow:

```bash
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/lustrahair run dev
```

The API endpoint is `POST /api/try-on`. The frontend calls it through the shared proxy using the generated `useGenerateTryOn` hook.

## Deploy

The app is configured as a deployable React/Vite artifact. Use Replit's Publish flow after confirming the preview. The static frontend is built with:

```bash
pnpm --filter @workspace/lustrahair run build
```

## AI architecture

The client sends `imageData`, `style`, `color`, and `gender` (`male` or `female`) to `POST /api/try-on`. The API validates the request with the OpenAPI-generated `GenerateTryOnBody` schema and returns:

- `previewImage`: the image to render
- `mode`: `simulation` or `provider`
- `message`: a user-facing status message

With no provider configured, the current fallback returns the uploaded/demo image and the client presents a gender- and style-specific strand-rendered hair overlay over the head in the comparison treatment. This is a meaningful visual prototype, but is intentionally not described as photorealistic AI.

To connect a production image-to-image provider:

1. Add the provider SDK or server-side HTTP adapter to `artifacts/api-server`.
2. Store provider credentials in Replit Secrets; never expose them to the browser.
3. Add the provider request/response mapping inside `src/routes/try-on.ts` or a focused service module.
4. Keep the public contract unchanged: accept the validated `TryOnInput` shape and return `TryOnResult`.
5. Set `TRY_ON_PROVIDER_URL` (or the provider-specific configuration used by the adapter) and return `mode: "provider"` only after a successful provider response.
6. Add moderation, timeout, retry, and queue behavior before handling real user traffic.

## Known limitations

- The fallback does not transform hair pixels or claim photorealistic results.
- Uploads are held in browser memory for the current session; there is no persistent image storage.
- Save is local to the current browser/device, and the demo commerce actions do not create real orders.
- A production model may need background processing rather than a synchronous request.

## Privacy considerations

The prototype does not persist uploaded images to a database. A production implementation should obtain explicit consent, clearly describe provider processing, delete source and generated images on a defined schedule, encrypt data in transit and at rest, and avoid sending images to a model provider without the user's knowledge.

The built-in demo uses a local real-person portrait asset so the experience can be evaluated without uploading a photo. Replace that asset with a properly licensed brand-owned image before production.

## Production roadmap

1. Secure image storage with short-lived access URLs and automatic deletion.
2. Consent records, age/eligibility checks, privacy policy, and regional data controls.
3. Image moderation and safety review for uploads and generated results.
4. Queue-backed generation with progress events, cancellation, retries, and rate limits.
5. Observability for latency, provider failures, queue depth, and model quality.
6. Product analytics for look selection, conversion, saves, and colour-match requests.
7. Model evaluation against diverse hair textures, skin tones, lighting, and image quality.
8. Real product catalog, inventory, checkout, shipping, and customer support integrations.