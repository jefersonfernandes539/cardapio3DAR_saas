"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@cardapio/ui";

export interface CategoryRow {
  id: string;
  name: string;
  order: number;
  dishCount: number;
}

export function CategoryManager({ initialCategories }: { initialCategories: CategoryRow[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);

  async function refresh() {
    router.refresh();
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    setBusy(true);
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    setBusy(false);
    if (res.ok) {
      const category = await res.json();
      setCategories((prev) => [...prev, { ...category, dishCount: 0 }]);
      setNewName("");
      refresh();
    }
  }

  async function handleRename(id: string, name: string) {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)));
    await fetch(`/api/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir esta categoria e todos os seus pratos?")) return;
    setCategories((prev) => prev.filter((c) => c.id !== id));
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    refresh();
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= categories.length) return;
    const next = [...categories];
    const a = next[index];
    const b = next[target];
    if (!a || !b) return;
    next[index] = b;
    next[target] = a;
    setCategories(next);

    await Promise.all(
      next.map((category, i) =>
        fetch(`/api/categories/${category.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: i }),
        }),
      ),
    );
    refresh();
  }

  return (
    <div className="max-w-xl">
      <div className="mb-6 flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nova categoria (ex.: Sobremesas)"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        />
        <Button onClick={handleCreate} disabled={busy}>
          Adicionar
        </Button>
      </div>

      <ul className="flex flex-col gap-2">
        {categories.map((category, index) => (
          <li
            key={category.id}
            className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white p-3 shadow-card"
          >
            <div className="flex flex-col">
              <button
                disabled={index === 0}
                onClick={() => handleMove(index, -1)}
                className="text-gray-400 hover:text-gray-700 disabled:opacity-30"
                aria-label="Mover para cima"
              >
                ▲
              </button>
              <button
                disabled={index === categories.length - 1}
                onClick={() => handleMove(index, 1)}
                className="text-gray-400 hover:text-gray-700 disabled:opacity-30"
                aria-label="Mover para baixo"
              >
                ▼
              </button>
            </div>

            <input
              defaultValue={category.name}
              onBlur={(e) => e.target.value !== category.name && handleRename(category.id, e.target.value)}
              className="flex-1 rounded-lg border border-transparent px-2 py-1 text-sm font-medium hover:border-gray-200 focus:border-brand-500 focus:outline-none"
            />

            <span className="text-xs text-gray-400">{category.dishCount} prato(s)</span>

            <button
              onClick={() => handleDelete(category.id)}
              className="text-sm font-medium text-red-500 hover:text-red-700"
            >
              Excluir
            </button>
          </li>
        ))}
      </ul>

      {categories.length === 0 && (
        <p className="text-sm text-gray-500">Nenhuma categoria ainda. Crie a primeira acima.</p>
      )}
    </div>
  );
}
