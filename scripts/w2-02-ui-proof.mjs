const visibleComponent = (value) => typeof value === "string" && value !== "none" && value !== "0px" && value !== "rgba(0, 0, 0, 0)";

export function focusIndicatorChanged(before, after, elementTag) {
  if (["body", "main", "html"].includes(String(elementTag).toLowerCase())) return false;
  const changedOutline = after.outlineStyle !== before.outlineStyle || after.outlineWidth !== before.outlineWidth || after.outlineColor !== before.outlineColor;
  const changedShadow = after.boxShadow !== before.boxShadow;
  return (changedOutline && after.outlineStyle !== "none" && visibleComponent(after.outlineWidth)) || (changedShadow && visibleComponent(after.boxShadow));
}

export function themeResolved(theme, actual) {
  const expected = theme === "dark" ? { dataTheme: "dark", background: "#0b1622", text: "#e7eef6" } : { dataTheme: "light", background: "#f4f7fb", text: "#102235" };
  return actual.dataTheme === expected.dataTheme && actual.background.toLowerCase() === expected.background && actual.text.toLowerCase() === expected.text;
}
