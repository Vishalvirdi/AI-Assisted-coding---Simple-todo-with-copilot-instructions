import { Router } from "express";
import { z } from "zod";

const createTodoSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
  })
  .strict();

const updateTodoSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    completed: z.boolean().optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0);

function parseId(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function success(data) {
  return { success: true, data, error: null };
}

function failure(code, message) {
  return { success: false, data: null, error: { code, message } };
}

export function createTodosRouter(repository) {
  const router = Router();

  router.get("/", (_request, response) => {
    response.json(success(repository.list()));
  });

  router.post("/", (request, response) => {
    const parsed = createTodoSchema.safeParse(request.body);
    if (!parsed.success) {
      response
        .status(400)
        .json(failure("INVALID_TODO", "Provide a title of 1 to 200 characters."));
      return;
    }

    response.status(201).json(success(repository.create(parsed.data.title)));
  });

  router.patch("/:id", (request, response) => {
    const id = parseId(request.params.id);
    if (id === null) {
      response.status(400).json(failure("INVALID_ID", "Todo ID must be positive."));
      return;
    }

    const parsed = updateTodoSchema.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json(
        failure(
          "INVALID_TODO",
          "Provide a title or completion status using valid values.",
        ),
      );
      return;
    }

    const todo = repository.update(id, parsed.data);
    if (!todo) {
      response.status(404).json(failure("NOT_FOUND", "Todo was not found."));
      return;
    }

    response.json(success(todo));
  });

  router.delete("/:id", (request, response) => {
    const id = parseId(request.params.id);
    if (id === null) {
      response.status(400).json(failure("INVALID_ID", "Todo ID must be positive."));
      return;
    }

    if (!repository.remove(id)) {
      response.status(404).json(failure("NOT_FOUND", "Todo was not found."));
      return;
    }

    response.json(success({ id }));
  });

  return router;
}
