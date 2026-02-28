do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'tweets_tweet_id_unique'
      and conrelid = 'public.tweets'::regclass
  ) then
    alter table public.tweets
      add constraint tweets_tweet_id_unique unique (tweet_id);
  end if;
end $$;
