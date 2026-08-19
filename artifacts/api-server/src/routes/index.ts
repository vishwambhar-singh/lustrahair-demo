import { Router, type IRouter } from "express";
import healthRouter from "./health";
import tryOnRouter from "./try-on";

const router: IRouter = Router();

router.use(healthRouter);
router.use(tryOnRouter);

export default router;
