---
name: LustraHair AI boundary
description: The durable decision for how LustraHair should evolve from prototype simulation to production image-to-image generation.
---

The try-on experience should preserve a provider-neutral server contract and clearly distinguish simulation mode from provider-backed generation in the UI.

**Why:** The first release must be usable without secrets or a model account, while shoppers should not be misled into believing the fallback is photorealistic AI.

**How to apply:** Keep provider credentials server-side, validate the existing input/output shape at the API boundary, and add storage, consent, moderation, queueing, retries, and evaluation before enabling real traffic.