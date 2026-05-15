import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  const { collectionId, imageIds } = body;
  if (!collectionId || !Array.isArray(imageIds) || imageIds.length === 0) {
    return NextResponse.json(
      { error: "collectionId and imageIds[] required" },
      { status: 400 }
    );
  }
  const rows = imageIds.map((image_id: string) => ({
    collection_id: collectionId,
    image_id,
  }));
  // upsert in case some already exist
  const { error } = await supabaseAdmin
    .from("collection_images")
    .upsert(rows, { onConflict: "collection_id,image_id" });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
