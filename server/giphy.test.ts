/**
 * Giphy API key smoke test
 * Verifies that VITE_GIPHY_API_KEY is set and returns valid results from the Giphy trending endpoint.
 */
import { describe, it, expect } from "vitest";

const GIPHY_API_KEY = process.env.VITE_GIPHY_API_KEY;

describe("Giphy API key", () => {
  it("should be configured", () => {
    expect(GIPHY_API_KEY).toBeTruthy();
    expect(typeof GIPHY_API_KEY).toBe("string");
    expect(GIPHY_API_KEY!.length).toBeGreaterThan(10);
  });

  it("should return trending GIFs from the Giphy API", async () => {
    const res = await fetch(
      `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=1&rating=g`
    );
    expect(res.ok).toBe(true);
    const json = await res.json() as { data: unknown[]; meta: { status: number } };
    expect(json.meta.status).toBe(200);
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);
  });
});
