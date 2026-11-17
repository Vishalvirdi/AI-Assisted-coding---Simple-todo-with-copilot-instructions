import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { createServer } from "node:http";
import { createApp } from "../server/app.js";

let server;
let database;
let baseUrl;

beforeEach(async () => {
  const app = createApp({ databasePath: ":memory:", logger: (_request, _response, next) => next() });
  database = app.locals.database;
  server = createServer(app);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}/api/todos`;
});

afterEach(async () => {
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
  database.close();
});

test("creates and lists a task", async () => {
  const createResponse = await fetch(baseUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title: "Plan the week" }),
  });
  assert.equal(createResponse.status, 201);
  const created = (await createResponse.json()).data;
  assert.equal(created.title, "Plan the week");
  assert.equal(created.completed, false);

  const listResponse = await fetch(baseUrl);
  const list = (await listResponse.json()).data;
  assert.ok(list.some((todo) => todo.id === created.id));
});

test("updates completion and deletes a task", async () => {
  const createResponse = await fetch(baseUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title: "Take a walk" }),
  });
  const todo = (await createResponse.json()).data;
  const updateResponse = await fetch(`${baseUrl}/${todo.id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ completed: true }),
  });
  assert.equal((await updateResponse.json()).data.completed, true);

  const deleteResponse = await fetch(`${baseUrl}/${todo.id}`, {
    method: "DELETE",
  });
  assert.equal(deleteResponse.status, 200);
  assert.equal((await fetch(`${baseUrl}/${todo.id}`, { method: "DELETE" })).status, 404);
});

test("rejects invalid task input and unknown fields", async () => {
  for (const body of [{ title: "   " }, { title: "Do work", completed: true }]) {
    const response = await fetch(baseUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    assert.equal(response.status, 400);
  }
});
