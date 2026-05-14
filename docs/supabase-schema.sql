create table recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique,
  description text,
  cuisine text,
  difficulty text,
  prep_time_minutes integer,
  cook_time_minutes integer,
  servings integer,
  rating integer,
  is_favorite boolean default false,
  is_archived boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table recipe_pages (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid references recipes(id) on delete cascade,
  page_number integer not null,
  image_url text not null,
  image_width integer,
  image_height integer,
  ocr_text text,
  page_type text default 'unknown',
  created_at timestamptz default now()
);

create table tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  type text default 'custom'
);

create table recipe_tags (
  recipe_id uuid references recipes(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (recipe_id, tag_id)
);

create table collections (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  cover_image_url text,
  sort_order integer default 0
);

create table collection_recipes (
  collection_id uuid references collections(id) on delete cascade,
  recipe_id uuid references recipes(id) on delete cascade,
  sort_order integer default 0,
  primary key (collection_id, recipe_id)
);

create table notes (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid references recipes(id) on delete cascade,
  body text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
