-- 1) Enable pgvector
create extension if not exists vector;

-- 2) Add embeddings column
alter table public.tweets
add column if not exists embedding vector(1536);

-- 3) Similarity search function
create or replace function public.match_tweets(
  query_embedding vector(1536),
  match_threshold float default 0.3,
  match_count int default 15
)
returns table (
  id text,
  content text,
  similarity float
)
language sql
stable
as $$
  select
    t.tweet_id as id,
    t.tweet_text as content,
    1 - (t.embedding <=> query_embedding) as similarity
  from public.tweets t
  where t.embedding is not null
    and t.tweet_text is not null
    and 1 - (t.embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
$$;
