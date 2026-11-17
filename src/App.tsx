import { useEffect, useMemo, useState, type FormEvent } from "react";
import Button from "./components/ui/Button";
import Card from "./components/ui/Card";
import Checkbox from "./components/ui/Checkbox";
import TextField from "./components/ui/TextField";
import { todoService } from "./services/todoService";
import type { Todo, TodoFilter } from "./types";

const filters: { value: TodoFilter; label: string }[] = [
  { value: "all", label: "All tasks" },
  { value: "active", label: "In progress" },
  { value: "completed", label: "Completed" },
];

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<TodoFilter>("all");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    todoService
      .list(controller.signal)
      .then(setTodos)
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            reason instanceof Error ? reason.message : "Could not load tasks.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, []);

  const remainingCount = todos.filter((todo) => !todo.completed).length;
  const visibleTodos = useMemo(
    () =>
      todos.filter((todo) => {
        if (filter === "active") return !todo.completed;
        if (filter === "completed") return todo.completed;
        return true;
      }),
    [filter, todos],
  );

  async function addTodo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle || saving) return;

    setSaving(true);
    setError("");
    try {
      const created = await todoService.create(cleanTitle);
      setTodos((current) => [created, ...current]);
      setTitle("");
      setFilter("all");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not add task.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleTodo(todo: Todo) {
    setError("");
    try {
      const updated = await todoService.update(todo.id, {
        completed: !todo.completed,
      });
      setTodos((current) => current.map((item) => item.id === todo.id ? updated : item));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not update task.");
    }
  }

  async function deleteTodo(todo: Todo) {
    setError("");
    try {
      await todoService.remove(todo.id);
      setTodos((current) => current.filter((item) => item.id !== todo.id));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not delete task.");
    }
  }

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <header className="mb-9 flex items-end justify-between gap-4">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-muted">
              A little more focus
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              Daymark<span className="text-sage">.</span>
            </h1>
          </div>
          <div className="mb-1 text-right">
            <p className="text-3xl font-semibold tabular-nums text-ink">
              {remainingCount.toString().padStart(2, "0")}
            </p>
            <p className="text-xs font-medium text-muted">left to do</p>
          </div>
        </header>

        <Card className="overflow-hidden">
          <form onSubmit={addTodo} className="flex gap-3 border-b border-line p-4 sm:p-6">
            <TextField
              id="new-todo"
              label="New task"
              maxLength={200}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="What needs your attention?"
              value={title}
              required
            />
            <Button type="submit" variant="primary" disabled={!title.trim() || saving}>
              {saving ? "Adding…" : "Add task"}
            </Button>
          </form>

          <div className="flex flex-wrap items-center justify-between gap-3 px-4 pb-4 pt-5 sm:px-6">
            <h2 className="text-sm font-semibold text-ink">Your list</h2>
            <div aria-label="Filter tasks" className="flex rounded-full bg-surface p-1" role="group">
              {filters.map((item) => (
                <button
                  aria-pressed={filter === item.value}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    filter === item.value
                      ? "bg-white text-ink shadow-sm"
                      : "text-muted hover:text-ink"
                  }`}
                  key={item.value}
                  onClick={() => setFilter(item.value)}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="mx-4 mb-3 rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger sm:mx-6" role="alert">
              {error}
            </p>
          )}

          {loading ? (
            <p className="px-6 py-12 text-center text-sm text-muted" role="status">
              Loading your tasks…
            </p>
          ) : visibleTodos.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="mb-2 text-lg font-medium text-ink">
                {todos.length === 0 ? "A clear day starts here." : "Nothing in this view."}
              </p>
              <p className="text-sm text-muted">
                {todos.length === 0
                  ? "Add a task above and make a little progress."
                  : "Try another filter to find your tasks."}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-line px-4 sm:px-6">
              {visibleTodos.map((todo) => (
                <li className="flex items-center gap-3 py-4" key={todo.id}>
                  <Checkbox
                    aria-label={`Mark "${todo.title}" as ${todo.completed ? "incomplete" : "complete"}`}
                    checked={todo.completed}
                    label={`Mark "${todo.title}" as ${todo.completed ? "incomplete" : "complete"}`}
                    onChange={() => void toggleTodo(todo)}
                  />
                  <span
                    className={`min-w-0 flex-1 break-words text-sm ${
                      todo.completed ? "text-muted line-through" : "text-ink"
                    }`}
                  >
                    {todo.title}
                  </span>
                  <Button
                    aria-label={`Delete "${todo.title}"`}
                    className="px-3 py-2"
                    onClick={() => void deleteTodo(todo)}
                    type="button"
                    variant="ghost"
                  >
                    <span aria-hidden="true">×</span>
                  </Button>
                </li>
              ))}
            </ul>
          )}

          <footer className="border-t border-line bg-surface/70 px-4 py-3 text-center text-xs text-muted sm:px-6">
            Your tasks are saved on this device.
          </footer>
        </Card>
        <p className="mt-5 text-center text-xs text-muted">
          One step at a time is still forward.
        </p>
      </div>
    </main>
  );
}
