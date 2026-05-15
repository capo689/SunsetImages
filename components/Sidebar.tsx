"use client";

import Link from "next/link";
import type { CollectionRow } from "./GalleryClient";

type Props = {
  collections: CollectionRow[];
  activeId?: string;
  name: string;
  onSignOut: () => void;
};

export default function Sidebar({ collections, activeId, name, onSignOut }: Props) {
  return (
    <aside className="w-64 border-r border-[var(--border)] bg-[var(--panel)] p-4 flex flex-col">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">SM Review</h2>
        <p className="text-xs text-[var(--muted)] mt-1 truncate">{name}</p>
      </div>

      <nav className="space-y-1 flex-1 overflow-y-auto">
        <Link
          href="/gallery"
          className={`block px-3 py-2 rounded text-sm ${
            !activeId
              ? "bg-[var(--accent)] text-black"
              : "hover:bg-black text-[var(--text)]"
          }`}
        >
          All images
        </Link>

        {collections.length > 0 && (
          <div className="pt-4">
            <p className="px-3 text-xs uppercase tracking-wider text-[var(--muted)] mb-2">
              Collections
            </p>
            {collections.map((c) => (
              <Link
                key={c.id}
                href={`/collections/${c.id}`}
                className={`block px-3 py-2 rounded text-sm truncate ${
                  activeId === c.id
                    ? "bg-[var(--accent)] text-black"
                    : "hover:bg-black text-[var(--text)]"
                }`}
              >
                {c.name}
              </Link>
            ))}
          </div>
        )}
      </nav>

      <button
        onClick={onSignOut}
        className="mt-4 text-xs text-[var(--muted)] hover:text-[var(--text)] text-left px-3 py-2"
      >
        Sign out
      </button>
    </aside>
  );
}
