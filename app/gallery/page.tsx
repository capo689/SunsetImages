import { supabaseAdmin } from "@/lib/supabase-server";
import GalleryClient from "@/components/GalleryClient";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const [{ data: images }, { data: collections }] = await Promise.all([
    supabaseAdmin
      .from("images_with_counts")
      .select("id, filename, comment_count")
      .order("filename"),
    supabaseAdmin
      .from("collections")
      .select("id, name")
      .order("created_at", { ascending: false }),
  ]);

  return (
    <GalleryClient
      title="All images"
      images={images ?? []}
      collections={collections ?? []}
    />
  );
}
