import type { Board } from "../types/types";

const API_URL = import.meta.env.VITE_API_URL || "";

// ✅ Fetch all boards
export async function fetchBoards(): Promise<Board[]> {
  const res = await fetch(`${API_URL}/api/boards`);
  if (!res.ok) throw new Error("Failed to fetch boards");
  const data = await res.json();
  return data.data;
}

// ✅ Fetch board by ID
export async function fetchBoardById(id: string): Promise<Board> {
  const res = await fetch(`${API_URL}/api/boards/${id}`);
  if (!res.ok) throw new Error("Failed to fetch board");
  const data = await res.json();
  return data.data;
}

// Story 3.1: Create a new board
export async function createBoard(name: string, userId?: string | null): Promise<Board> {
  const res = await fetch(`${API_URL}/api/boards`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, userId }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error?.message || "Failed to create board");
  }
  const data = await res.json();
  return data.data;
}

// Story 3.2: Update board name
export async function updateBoard(id: string, name: string): Promise<Board> {
  const res = await fetch(`${API_URL}/api/boards/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error?.message || "Failed to update board");
  }
  const data = await res.json();
  return data.data;
}
