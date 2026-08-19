import app from "./app";
import { logger } from "./lib/logger";

export default app;

// On Vercel the platform invokes this module as a serverless handler, so we
// must not start a long-lived HTTP server. Locally (VERCEL unset) we still
// listen on PORT so the dev workflow is unchanged.
if (!process.env["VERCEL"]) {
  const rawPort = process.env["PORT"];

  if (!rawPort) {
    throw new Error(
      "PORT environment variable is required but was not provided.",
    );
  }

  const port = Number(rawPort);

  if (Number.isNaN(port) || port <= 0) {
    throw new Error(`Invalid PORT value: "${rawPort}"`);
  }

  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }

    logger.info({ port }, "Server listening");
  });
}
