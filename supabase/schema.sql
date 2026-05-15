-- SM Gallery schema
-- Run this once in the Supabase SQL Editor

create extension if not exists "pgcrypto";

create table if not exists images (
  id uuid primary key default gen_random_uuid(),
  filename text unique not null,
  created_at timestamptz default now()
);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  image_id uuid not null references images(id) on delete cascade,
  author_name text not null,
  content text not null,
  created_at timestamptz default now()
);

create index if not exists comments_image_id_idx on comments(image_id);
create index if not exists comments_created_at_idx on comments(created_at);

create table if not exists collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

create table if not exists collection_images (
  collection_id uuid not null references collections(id) on delete cascade,
  image_id uuid not null references images(id) on delete cascade,
  added_at timestamptz default now(),
  primary key (collection_id, image_id)
);

create index if not exists collection_images_collection_idx on collection_images(collection_id);
create index if not exists collection_images_image_idx on collection_images(image_id);

-- Convenience view: image with comment count
create or replace view images_with_counts as
select
  i.id,
  i.filename,
  i.created_at,
  coalesce(c.comment_count, 0) as comment_count
from images i
left join (
  select image_id, count(*) as comment_count
  from comments
  group by image_id
) c on c.image_id = i.id;
