import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  const { name, imageIds } = body;
  if (!name || !Array.isArray(imageIds)) {
    return NextResponse.json(
      { error: "name and imageIds[] required" },
      { status: 400 }
    );
  }

  const { data: collection, error } = await supabaseAdmin
    .from("collections")
    .insert({ name: String(name).slice(0, 120) })
    .select("id, name")
    .single();
  if (error || !collection) {
    return NextResponse.json(
      { error: error?.message || "create failed" },
      { status: 500 }
    );
  }

  if (imageIds.length > 0) {
    const rows = imageIds.map((image_id: string) => ({
      collection_id: collection.id,
      image_id,
    }));
    const { error: linkError } = await supabaseAdmin
      .from("collection_images")
      .insert(rows);
    if (linkError) {
      return NextResponse.json({ error: linkError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ id: collection.id, name: collection.name });
}
