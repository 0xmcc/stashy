create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  owner_user_id text not null,
  name text not null,
  slug text not null,
  visibility text not null default 'private'
    check (visibility in ('private', 'public', 'unlisted')),
  is_system boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (owner_user_id, slug)
);

create index if not exists collections_owner_idx
  on public.collections (owner_user_id);

create table if not exists public.collection_tweets (
  collection_id uuid not null references public.collections(id) on delete cascade,
  tweet_id text not null references public.tweets(tweet_id) on delete cascade,
  tags text[] not null default '{}',
  notes text,
  added_at timestamptz not null default timezone('utc', now()),
  primary key (collection_id, tweet_id)
);

create index if not exists collection_tweets_tweet_idx
  on public.collection_tweets (tweet_id);

alter table public.collections enable row level security;
alter table public.collection_tweets enable row level security;

revoke all on public.collections from anon, authenticated;
revoke all on public.collection_tweets from anon, authenticated;

drop policy if exists "service_role_full_collections" on public.collections;
create policy "service_role_full_collections"
  on public.collections
  for all
  to service_role
  using (true)
  with check (true);

drop policy if exists "service_role_full_collection_tweets" on public.collection_tweets;
create policy "service_role_full_collection_tweets"
  on public.collection_tweets
  for all
  to service_role
  using (true)
  with check (true);
