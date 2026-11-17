import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { createDatabase } from "./database.js";
import { createTodoRepository } from "./todoRepository.js";
import { createTodosRouter } from "./todosRouter.js";

const serverDirectory = path.dirname(fileURLToPath(import.meta.url));
const clientDirectory = path.resolve(serverDirectory, "../dist");

export function createApp({
  databasePath = process.env.TODO_DB_PATH ?? path.resolve("data/todos.sqlite"),
  logger = pinoHttp(),
} = {}) {
  const database = createDatabase(databasePath);
  const repository = createTodoRepository(database);
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(logger);
  app.use(express.json({ limit: "10kb" }));
  app.use("/api/todos", createTodosRouter(repository));

  if (existsSync(clientDirectory)) {
    app.use(express.static(clientDirectory));
    app.use((request, response, next) => {
      if (request.method !== "GET" || request.path.startsWith("/api/")) {
        next();
        return;
      }
      response.sendFile(path.join(clientDirectory, "index.html"));
    });
  }

  app.use((request, response) => {
    response.status(404).json({
      success: false,
      data: null,
      error: { code: "NOT_FOUND", message: "Resource was not found." },
    });
  });

  app.use((error, request, response, _next) => {
    request.log.error({ err: error }, "Request failed");
    const status = error.status === 400 ? 400 : 500;
    response.status(status).json({
      success: false,
      data: null,
      error: {
        code: status === 400 ? "INVALID_REQUEST" : "INTERNAL_ERROR",
        message:
          status === 400
            ? "Request body must be valid JSON."
            : "An unexpected error occurred.",
      },
    });
  });

  app.locals.database = database;
  return app;
}
