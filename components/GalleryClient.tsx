"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Thumbnail from "./Thumbnail";
import Lightbox from "./Lightbox";
import Sidebar from "./Sidebar";
import SelectionBar from "./SelectionBar";

export type ImageRow = {
  id: string;
  filename: string;
  comment_count: number;
};

export type CollectionRow = {
  id: string;
  name: string;
};

type Props = {
  title: string;
  images: ImageRow[];
  collections: CollectionRow[];
  collectionId?: string;
};

export default function GalleryClient({
  title,
  images,
  collections,
  collectionId,
}: Props) {
  const router = useRouter();
  const [name, setName] = useState<string>("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openImageId, setOpenImageId] = useState<string | null>(null);

  useEffect(() => {
    setName(localStorage.getItem("sm_reviewer_name") || "");
  }, []);

  const openImage = useMemo(
    () => images.find((i) => i.id === openImageId) ?? null,
    [images, openImageId]
  );

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function clearSelection() {
    setSelected(new Set());
  }

  async function createCollection(collectionName: string) {
    const res = await fetch("/api/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: collectionName,
        imageIds: Array.from(selected),
      }),
    });
    if (res.ok) {
      const { id } = await res.json();
      clearSelection();
      router.push(`/collections/${id}`);
    }
  }

  async function addToCollection(targetId: string) {
    await fetch("/api/collections/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        collectionId: targetId,
        imageIds: Array.from(selected),
      }),
    });
    clearSelection();
    router.refresh();
  }

  function signOut() {
    document.cookie = "sm_auth=; path=/; max-age=0";
    localStorage.removeItem("sm_reviewer_name");
    router.push("/");
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar
        collections={collections}
        activeId={collectionId}
        name={name}
        onSignOut={signOut}
      />

      <main className="flex-1 p-6 pb-32">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">{title}</h1>
            <p className="text-sm text-[var(--muted)]">
              {images.length} {images.length === 1 ? "image" : "images"}
            </p>
          </div>
          {collectionId && (
            <Link
              href="/gallery"
              className="text-sm text-[var(--muted)] hover:text-[var(--text)]"
            >
              All images
            </Link>
          )}
        </header>

        {images.length === 0 ? (
          <p className="text-[var(--muted)]">No images in this view yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {images.map((img) => (
              <Thumbnail
                key={img.id}
                image={img}
                selected={selected.has(img.id)}
                onSelect={() => toggleSelect(img.id)}
                onOpen={() => setOpenImageId(img.id)}
              />
            ))}
          </div>
        )}
      </main>

      {selected.size > 0 && (
        <SelectionBar
          count={selected.size}
          collections={collections}
          onClear={clearSelection}
          onCreate={createCollection}
          onAdd={addToCollection}
        />
      )}

      {openImage && (
        <Lightbox
          image={openImage}
          name={name}
          onClose={() => {
            setOpenImageId(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
