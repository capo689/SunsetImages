"use client";

import { useState } from "react";
import type { CollectionRow } from "./GalleryClient";

type Props = {
  count: number;
  collections: CollectionRow[];
  onClear: () => void;
  onCreate: (name: string) => void;
  onAdd: (collectionId: string) => void;
};

export default function SelectionBar({
  count,
  collections,
  onClear,
  onCreate,
  onAdd,
}: Props) {
  const [mode, setMode] = useState<"idle" | "create" | "add">("idle");
  const [name, setName] = useState("");

  function reset() {
    setMode("idle");
    setName("");
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-[var(--border)] bg-[var(--panel)] p-3 md:left-64 z-40">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm">
          <span className="font-semibold">{count}</span> selected
        </span>

        <button
          onClick={onClear}
          className="text-xs text-[var(--muted)] hover:text-[var(--text)] px-2 py-1"
        >
          Clear
        </button>

        <div className="flex-1" />

        {mode === "idle" && (
          <>
            <button
              onClick={() => setMode("create")}
              className="px-3 py-2 text-sm rounded bg-[var(--accent)] text-black font-medium hover:opacity-90"
            >
              New collection
            </button>
            {collections.length > 0 && (
              <button
                onClick={() => setMode("add")}
                className="px-3 py-2 text-sm rounded border border-[var(--border)] hover:bg-black"
              >
                Add to collection
              </button>
            )}
          </>
        )}

        {mode === "create" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (name.trim()) {
                onCreate(name.trim());
                reset();
              }
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Collection name"
              autoFocus
              className="px-3 py-2 text-sm rounded bg-black border border-[var(--border)] focus:outline-none focus:border-[var(--accent)]"
            />
            <button
              type="submit"
              className="px-3 py-2 text-sm rounded bg-[var(--accent)] text-black font-medium"
            >
              Create
            </button>
            <button
              type="button"
              onClick={reset}
              className="text-xs text-[var(--muted)] hover:text-[var(--text)]"
            >
              Cancel
            </button>
          </form>
        )}

        {mode === "add" && (
          <div className="flex items-center gap-2">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  onAdd(e.target.value);
                  reset();
                }
              }}
              defaultValue=""
              className="px-3 py-2 text-sm rounded bg-black border border-[var(--border)]"
            >
              <option value="" disabled>
                Choose...
              </option>
              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={reset}
              className="text-xs text-[var(--muted)] hover:text-[var(--text)]"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
