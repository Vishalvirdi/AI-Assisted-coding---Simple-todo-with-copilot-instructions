function toTodo(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    title: row.title,
    completed: row.completed === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function createTodoRepository(database) {
  const listStatement = database.prepare(
    "SELECT id, title, completed, created_at, updated_at FROM todos ORDER BY completed ASC, created_at DESC, id DESC",
  );
  const getStatement = database.prepare(
    "SELECT id, title, completed, created_at, updated_at FROM todos WHERE id = ?",
  );

  return {
    list() {
      return listStatement.all().map(toTodo);
    },

    get(id) {
      return toTodo(getStatement.get(id));
    },

    create(title) {
      const now = new Date().toISOString();
      const result = database
        .prepare(
          "INSERT INTO todos (title, created_at, updated_at) VALUES (?, ?, ?)",
        )
        .run(title, now, now);
      return toTodo(getStatement.get(Number(result.lastInsertRowid)));
    },

    update(id, changes) {
      const current = this.get(id);
      if (!current) {
        return null;
      }

      const title = changes.title ?? current.title;
      const completed = changes.completed ?? current.completed;
      database
        .prepare(
          "UPDATE todos SET title = ?, completed = ?, updated_at = ? WHERE id = ?",
        )
        .run(title, Number(completed), new Date().toISOString(), id);
      return this.get(id);
    },

    remove(id) {
      return database.prepare("DELETE FROM todos WHERE id = ?").run(id)
        .changes > 0;
    },
  };
}
