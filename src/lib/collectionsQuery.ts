import type { SupabaseClient } from "@supabase/supabase-js";

export interface CollectionUpsertResult {
  collection_id: string;
  used_legacy_owner_column: boolean;
}

function errorToString(error: unknown): string {
  if (!error) return "";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (typeof error === "object") {
    const err = error as Record<string, unknown>;
    const pieces = [err.code, err.message, err.details, err.hint].filter(
      (value): value is string => typeof value === "string" && value.trim().length > 0
    );
    if (pieces.length > 0) return pieces.join(" | ");
    return JSON.stringify(error);
  }
  return String(error);
}

function appendCollectionsMigrationHint(details: string): string {
  const hint = "Run supabase/sql/collections.sql to create collections + collection_tweets.";
  const trimmed = details.trim();
  if (!trimmed || trimmed === "{}") {
    return `${details} ${hint}`.trim();
  }
  return `${details} (${hint})`;
}

/**
 * Upserts the bookmarks system collection for ownerUserId.
 * Tries the modern `owner_user_id` column first; falls back to the legacy
 * `owner_x_user_id` column if the schema has not been migrated yet.
 */
export async function upsertBookmarksCollection(
  supabase: SupabaseClient,
  ownerUserId: string
): Promise<CollectionUpsertResult> {
  let usedLegacyOwnerColumn = false;

  let { data: collection, error: collectionError } = await supabase
    .from("collections")
    .upsert(
      {
        owner_user_id: ownerUserId,
        name: "Bookmarks",
        slug: "bookmarks",
        visibility: "private",
        is_system: true,
      },
      { onConflict: "owner_user_id,slug", ignoreDuplicates: false }
    )
    .select("id")
    .single();

  if (collectionError || !collection?.id) {
    usedLegacyOwnerColumn = true;
    const legacyAttempt = await supabase
      .from("collections")
      .upsert(
        {
          owner_x_user_id: ownerUserId,
          name: "Bookmarks",
          slug: "bookmarks",
          visibility: "private",
          is_system: true,
        },
        { onConflict: "owner_x_user_id,slug", ignoreDuplicates: false }
      )
      .select("id")
      .single();
    collection = legacyAttempt.data;
    collectionError = legacyAttempt.error;
  }

  if (collectionError || !collection?.id) {
    const details = appendCollectionsMigrationHint(
      errorToString(collectionError || "Collection row missing after upsert")
    );
    throw new Error(`Failed to upsert bookmarks collection: ${details}`);
  }

  return { collection_id: collection.id, used_legacy_owner_column: usedLegacyOwnerColumn };
}
