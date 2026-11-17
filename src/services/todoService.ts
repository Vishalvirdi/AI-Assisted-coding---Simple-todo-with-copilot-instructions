import type { Todo } from "../types";

interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: { code: string; message: string } | null;
}

async function request<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  const result = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !result.success || result.data === null) {
    throw new Error(result.error?.message ?? "The request could not be completed.");
  }

  return result.data;
}

export const todoService = {
  list(signal?: AbortSignal): Promise<Todo[]> {
    return request<Todo[]>("/api/todos", { signal });
  },

  create(title: string): Promise<Todo> {
    return request<Todo>("/api/todos", {
      method: "POST",
      body: JSON.stringify({ title }),
    });
  },

  update(id: number, changes: Partial<Pick<Todo, "title" | "completed">>) {
    return request<Todo>(`/api/todos/${id}`, {
      method: "PATCH",
      body: JSON.stringify(changes),
    });
  },

  remove(id: number): Promise<{ id: number }> {
    return request<{ id: number }>(`/api/todos/${id}`, {
      method: "DELETE",
    });
  },
};
