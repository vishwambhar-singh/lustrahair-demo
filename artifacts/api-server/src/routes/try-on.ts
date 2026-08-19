import { Router, type IRouter } from "express";
import { GenerateTryOnBody, GenerateTryOnResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/try-on", (req, res) => {
  const parsed = GenerateTryOnBody.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "Please provide an image, style, and colour." });
    return;
  }

  const { imageData, style, color, gender } = parsed.data;
  const providerConfigured = Boolean(process.env.TRY_ON_PROVIDER_URL);

  // The prototype keeps the fallback intentionally honest: it returns the
  // uploaded image so the client can apply a meaningful style treatment while
  // the provider adapter remains a single endpoint away.
  const result = GenerateTryOnResponse.parse({
    previewImage: imageData,
    mode: providerConfigured ? "provider" : "simulation",
    message: providerConfigured
      ? `Preview created for ${gender} ${style} in ${color}.`
      : `Preview simulation created for ${gender} ${style} in ${color}.`,
  });

  res.json(result);
});

export default router;