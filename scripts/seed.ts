import { createClient } from "@supabase/supabase-js";
import { readdirSync } from "fs";
import { join } from "path";
import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false },
});

async function main() {
  const dir = join(process.cwd(), "public", "images");
  const files = readdirSync(dir).filter((f) =>
    /\.(jpe?g|png|webp|gif)$/i.test(f)
  );

  console.log(`Found ${files.length} image files in public/images`);

  const { data: existing } = await supabase
    .from("images")
    .select("filename");
  const existingSet = new Set((existing ?? []).map((r) => r.filename));

  const toInsert = files
    .filter((f) => !existingSet.has(f))
    .map((filename) => ({ filename }));

  if (toInsert.length === 0) {
    console.log("Nothing new to insert.");
    return;
  }

  const { error } = await supabase.from("images").insert(toInsert);
  if (error) {
    console.error("Insert error:", error.message);
    process.exit(1);
  }
  console.log(`Inserted ${toInsert.length} new image rows.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
