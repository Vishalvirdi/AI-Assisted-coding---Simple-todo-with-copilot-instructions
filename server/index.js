import { createServer } from "node:http";
import pino from "pino";
import { createApp } from "./app.js";

const logger = pino();
const app = createApp({ logger: undefined });
const server = createServer(app);
const host = process.env.HOST ?? "127.0.0.1";
const port = Number(process.env.PORT ?? 3000);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535.");
}

server.listen(port, host, () => {
  logger.info({ host, port }, "To-do app server is listening");
});

function shutdown() {
  server.close((error) => {
    if (error) {
      logger.error({ err: error }, "Server shutdown failed");
      process.exitCode = 1;
    }
    app.locals.database.close();
  });
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
