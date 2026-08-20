import express, { type Express } from "express";
import cors from "cors";
import { pinoHttp } from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json({ limit: '12mb' }));
app.use(express.urlencoded({ extended: true, limit: '12mb' }));

app.use("/api", router);

app.get("/api/info", (_req, res) => {
  res.json({
    name: "LustraHair API",
    version: "0.1.0",
    endpoints: ["/api/info", "/api/healthz", "/api/try-on"],
  });
});

const FAVICON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#c48688"/><path d="M16 7c-3.6 0-6 2.4-6 6 0 3.4 2.4 7 6 12 3.6-5 6-8.6 6-12 0-3.6-2.4-6-6-6z" fill="#fff"/><circle cx="16" cy="13" r="2.6" fill="#c48688"/></svg>';

// Browsers auto-request a favicon; serve a real one to avoid 404 noise.
app.get(["/favicon.ico", "/favicon.svg"], (_req, res) => {
  res.type("image/svg+xml").send(FAVICON_SVG);
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDist = path.join(__dirname, "public");

if (existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get("/{*splat}", (_req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
} else {
  app.get("/", (_req, res) => {
    res.json({
      name: "LustraHair API",
      version: "0.1.0",
      endpoints: ["/api/healthz", "/api/try-on"],
    });
  });
}

export default app;
