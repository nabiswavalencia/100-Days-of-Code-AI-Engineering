import { describe, expect, it } from "vitest";
import { parseBudget } from "./budget.js";

describe("parseBudget", () => {
  it.each([
    ["300", 300],
    ["0", 0],
    [" 150 ", 150],
  ])("accepts %j as %i", (text, expected) => {
    expect(parseBudget(text)).toEqual({ budget: expected, error: null });
  });

  it("treats an empty box as 'no budget yet', not an error", () => {
    expect(parseBudget("")).toEqual({ budget: null, error: null });
  });

  it.each(["-5", "150.5", "abc"])("rejects %j with a message", (text) => {
    const { budget, error } = parseBudget(text);
    expect(budget).toBeNull();
    expect(error).toMatch(/whole number/);
  });
});
