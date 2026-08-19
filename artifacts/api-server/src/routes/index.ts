import { Router, type IRouter } from "express";
import healthRouter from "./health";
import tryOnRouter from "./try-on";

const router: IRouter = Router();

router.get("/", (_req, res) => {
  res.json({
    name: "LustraHair API",
    version: "0.1.0",
    endpoints: ["/api/healthz", "/api/try-on"],
  });
});

router.use(healthRouter);
router.use(tryOnRouter);

export default router;
