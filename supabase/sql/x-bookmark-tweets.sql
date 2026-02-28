create table if not exists public.x_bookmark_tweets (
  owner_x_user_id text not null,
  tweet_id text not null,
  tweet jsonb not null,
  fetched_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (owner_x_user_id, tweet_id)
);

create index if not exists x_bookmark_tweets_owner_fetched_idx
  on public.x_bookmark_tweets (owner_x_user_id, fetched_at desc);

alter table public.x_bookmark_tweets enable row level security;

revoke all on public.x_bookmark_tweets from anon, authenticated;

drop policy if exists "service_role_full_access_x_bookmark_tweets" on public.x_bookmark_tweets;
create policy "service_role_full_access_x_bookmark_tweets"
  on public.x_bookmark_tweets
  for all
  to service_role
  using (true)
  with check (true);
