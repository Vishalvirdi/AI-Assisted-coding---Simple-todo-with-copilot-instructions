# Daymark

A small, local-first to-do app. Tasks are stored in SQLite on the machine running the app.

## Requirements

- Node.js 22.5 or newer (the server uses Node's built-in `node:sqlite` module)

## Run locally

```sh
npm install
npm run dev
```

Open the address printed by Vite (normally `http://127.0.0.1:5173`). The Express API runs on `http://127.0.0.1:3000` and Vite proxies `/api` requests to it.

For a production build, run `npm run build` and then `npm start`; Express serves the built UI and API on `http://127.0.0.1:3000`.

The database is created at `data/todos.sqlite` by default. Set `TODO_DB_PATH` to use another file, `PORT` to change the server port, or `HOST` to change its bind address. The API has no user accounts and is intended for a single local user; keep it on loopback unless you add authentication and authorization.

## Validate

```sh
npm test
npm run build
```

Run one API test by name:

```sh
node --test --test-name-pattern="creates and lists a task" tests/todos.test.js
```
