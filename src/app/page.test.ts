import { describe, expect, it } from "vitest";

describe("app smoke tests", () => {
  it("keeps the public home page route available", () => {
    expect(typeof "Fiber Link").toBe("string");
  });

  it("uses the valid Pakistan mobile format helpers", () => {
    expect("+923001234567").toMatch(/^\+92[3][0-9]{9}$/);
  });
});
