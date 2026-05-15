"use client";

import { useEffect, useState } from "react";
import type { ImageRow } from "./GalleryClient";

type Comment = {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
};

type Props = {
  image: ImageRow;
  name: string;
  onClose: () => void;
};

export default function Lightbox({ image, name, onClose }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/comments?imageId=${image.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (active) {
          setComments(data.comments || []);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [image.id]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function post(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || !name) return;
    setPosting(true);
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageId: image.id,
        authorName: name,
        content: content.trim(),
      }),
    });
    if (res.ok) {
      const { comment } = await res.json();
      setComments((prev) => [...prev, comment]);
      setContent("");
    }
    setPosting(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[var(--panel)] border border-[var(--border)] rounded-lg max-w-5xl w-full max-h-[90vh] flex flex-col md:flex-row overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-1 bg-black flex items-center justify-center min-h-[300px]">
          <img
            src={`/images/${image.filename}`}
            alt={image.filename}
            className="max-w-full max-h-[90vh] object-contain"
          />
        </div>

        <aside className="w-full md:w-96 flex flex-col border-l border-[var(--border)]">
          <header className="flex items-start justify-between p-4 border-b border-[var(--border)]">
            <div>
              <p className="text-xs text-[var(--muted)]">Reviewing as</p>
              <p className="font-medium truncate">{name || "(no name)"}</p>
              <p className="text-xs text-[var(--muted)] mt-1 truncate">
                {image.filename}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-[var(--muted)] hover:text-[var(--text)] text-2xl leading-none px-2"
              aria-label="Close"
            >
              &times;
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading && (
              <p className="text-sm text-[var(--muted)]">Loading comments...</p>
            )}
            {!loading && comments.length === 0 && (
              <p className="text-sm text-[var(--muted)]">No comments yet.</p>
            )}
            {comments.map((c) => (
              <div key={c.id} className="text-sm">
                <div className="flex items-baseline gap-2">
                  <span className="font-medium">{c.author_name}</span>
                  <span className="text-xs text-[var(--muted)]">
                    {new Date(c.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-[var(--text)] whitespace-pre-wrap mt-0.5">
                  {c.content}
                </p>
              </div>
            ))}
          </div>

          <form
            onSubmit={post}
            className="p-4 border-t border-[var(--border)] space-y-2"
          >
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Add a comment..."
              rows={3}
              className="w-full px-3 py-2 rounded bg-black border border-[var(--border)] focus:outline-none focus:border-[var(--accent)] text-sm resize-none"
            />
            <button
              type="submit"
              disabled={posting || !content.trim() || !name}
              className="w-full py-2 rounded bg-[var(--accent)] text-black font-medium hover:opacity-90 disabled:opacity-50 text-sm"
            >
              {posting ? "Posting..." : "Post comment"}
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}
