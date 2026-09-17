"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown, ChevronUp, Plus, Tags, Trash2 } from "lucide-react";
import { Button, EmptyState } from "@cardapio/ui";

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
          className="flex-1 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        />
        <Button onClick={handleCreate} disabled={busy}>
          <Plus className="h-4 w-4" strokeWidth={2.25} />
          Adicionar
        </Button>
      </div>

      <ul className="flex flex-col gap-2">
        {categories.map((category, index) => (
          <li
            key={category.id}
            className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 pl-2 shadow-card"
          >
            <div className="flex flex-col text-gray-300">
              <button
                disabled={index === 0}
                onClick={() => handleMove(index, -1)}
                className="rounded hover:text-gray-600 disabled:opacity-30"
                aria-label="Mover para cima"
              >
                <ChevronUp className="h-4 w-4" strokeWidth={2} />
              </button>
              <button
                disabled={index === categories.length - 1}
                onClick={() => handleMove(index, 1)}
                className="rounded hover:text-gray-600 disabled:opacity-30"
                aria-label="Mover para baixo"
              >
                <ChevronDown className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>

            <input
              defaultValue={category.name}
              onBlur={(e) => e.target.value !== category.name && handleRename(category.id, e.target.value)}
              className="flex-1 rounded-lg border border-transparent px-2 py-1.5 text-sm font-semibold text-gray-800 transition-colors hover:border-gray-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />

            <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
              {category.dishCount} prato{category.dishCount === 1 ? "" : "s"}
            </span>

            <button
              onClick={() => handleDelete(category.id)}
              aria-label="Excluir categoria"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </li>
        ))}
      </ul>

      {categories.length === 0 && (
        <EmptyState
          icon={<Tags className="h-6 w-6" strokeWidth={1.75} />}
          title="Nenhuma categoria ainda"
          description="Crie a primeira acima para começar a montar o cardápio."
        />
      )}
    </div>
  );
}
