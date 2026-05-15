import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const imageId = url.searchParams.get("imageId");
  if (!imageId) {
    return NextResponse.json({ error: "imageId required" }, { status: 400 });
  }
  const { data, error } = await supabaseAdmin
    .from("comments")
    .select("id, author_name, content, created_at")
    .eq("image_id", imageId)
    .order("created_at", { ascending: true });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ comments: data });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  const { imageId, authorName, content } = body;
  if (!imageId || !authorName || !content) {
    return NextResponse.json(
      { error: "imageId, authorName, content required" },
      { status: 400 }
    );
  }
  const { data, error } = await supabaseAdmin
    .from("comments")
    .insert({
      image_id: imageId,
      author_name: String(authorName).slice(0, 80),
      content: String(content).slice(0, 4000),
    })
    .select("id, author_name, content, created_at")
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ comment: data });
}
