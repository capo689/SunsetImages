import { supabaseAdmin } from "@/lib/supabase-server";
import GalleryClient from "@/components/GalleryClient";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CollectionPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: collection } = await supabaseAdmin
    .from("collections")
    .select("id, name")
    .eq("id", params.id)
    .single();

  if (!collection) notFound();

  const { data: links } = await supabaseAdmin
    .from("collection_images")
    .select("image_id")
    .eq("collection_id", params.id);

  const imageIds = (links ?? []).map((l) => l.image_id);

  let images: { id: string; filename: string; comment_count: number }[] = [];
  if (imageIds.length > 0) {
    const { data } = await supabaseAdmin
      .from("images_with_counts")
      .select("id, filename, comment_count")
      .in("id", imageIds)
      .order("filename");
    images = data ?? [];
  }

  const { data: collections } = await supabaseAdmin
    .from("collections")
    .select("id, name")
    .order("created_at", { ascending: false });

  return (
    <GalleryClient
      title={collection.name}
      collectionId={collection.id}
      images={images}
      collections={collections ?? []}
    />
  );
}
