import assert from "node:assert/strict";
import test from "node:test";
import { focusIndicatorChanged, themeResolved } from "./w2-02-ui-proof.mjs";

test("focus proof requires a focus-only non-zero indicator on an actionable element", () => {
  const base = { outlineStyle: "none", outlineWidth: "0px", outlineColor: "rgba(0, 0, 0, 0)", boxShadow: "none" };
  assert.equal(focusIndicatorChanged(base, { ...base, boxShadow: "rgb(47, 115, 196) 0px 0px 0px 3px" }, "button"), true);
  assert.equal(focusIndicatorChanged(base, { ...base, borderStyle: "solid" }, "button"), false);
  assert.equal(focusIndicatorChanged(base, { ...base, boxShadow: "rgb(47, 115, 196) 0px 0px 0px 3px" }, "main"), false);
});

test("theme proof rejects ignored or mismatched resolved tokens", () => {
  assert.equal(themeResolved("dark", { dataTheme: "dark", background: "#0b1622", text: "#e7eef6" }), true);
  assert.equal(themeResolved("dark", { dataTheme: "light", background: "#f4f7fb", text: "#102235" }), false);
  assert.equal(themeResolved("light", { dataTheme: "light", background: "#0b1622", text: "#e7eef6" }), false);
});
