"use client";

import type { ImageRow } from "./GalleryClient";

type Props = {
  image: ImageRow;
  selected: boolean;
  onSelect: () => void;
  onOpen: () => void;
};

export default function Thumbnail({ image, selected, onSelect, onOpen }: Props) {
  return (
    <div
      className={`relative group aspect-square rounded overflow-hidden border ${
        selected ? "border-[var(--accent)]" : "border-[var(--border)]"
      } bg-black`}
    >
      <button
        onClick={onOpen}
        className="block w-full h-full focus:outline-none"
        aria-label={`Open ${image.filename}`}
      >
        <img
          src={`/images/${image.filename}`}
          alt={image.filename}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
          loading="lazy"
        />
      </button>

      {image.comment_count > 0 && (
        <span
          className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[var(--accent)] ring-2 ring-black"
          title={`${image.comment_count} comment${image.comment_count === 1 ? "" : "s"}`}
        />
      )}

      <label
        className="absolute top-2 left-2 flex items-center justify-center w-6 h-6 rounded bg-black/60 backdrop-blur cursor-pointer"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="checkbox"
          checked={selected}
          onChange={onSelect}
          className="accent-[var(--accent)] w-4 h-4"
        />
      </label>
    </div>
  );
}
