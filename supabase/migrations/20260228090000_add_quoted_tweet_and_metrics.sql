-- Migration to add quoted tweet data and public metrics to the tweets table

ALTER TABLE tweets
ADD COLUMN IF NOT EXISTS quoted_tweet JSONB,
ADD COLUMN IF NOT EXISTS public_metrics JSONB;
