import { beforeEach, describe, expect, it, vi } from "vitest";

const createClientMock = vi.fn();

vi.mock("@supabase/supabase-js", () => ({
  createClient: createClientMock,
}));

describe("fetchTweetById", () => {
  beforeEach(() => {
    vi.resetModules();
    createClientMock.mockReset();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
  });

  it("uses maybeSingle to avoid 406 when tweet row is missing", async () => {
    const maybeSingleMock = vi.fn(async () => ({ data: null, error: null }));
    const singleMock = vi.fn(async () => ({
      data: null,
      error: { message: "JSON object requested, multiple (or no) rows returned" },
    }));

    const eqMock = vi.fn(() => ({
      maybeSingle: maybeSingleMock,
      single: singleMock,
    }));

    const selectMock = vi.fn(() => ({
      eq: eqMock,
    }));

    const fromMock = vi.fn(() => ({
      select: selectMock,
    }));

    createClientMock.mockReturnValue({
      from: fromMock,
    });

    const { fetchTweetById } = await import("./supabase");
    await fetchTweetById("missing-tweet-id");

    expect(maybeSingleMock).toHaveBeenCalledTimes(1);
    expect(singleMock).not.toHaveBeenCalled();
  });
});
