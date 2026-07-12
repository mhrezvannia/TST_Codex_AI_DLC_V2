import tseslint from "typescript-eslint";

export default [
  {
    ignores: [
      ".codex/**",
      ".agents/**",
      ".history/**",
      ".codebase-memory/**",
      "aidlc/**",
      "docs/**",
      "node_modules/**",
      ".next/**",
      "**/.next/**",
      "**/next-env.d.ts",
      "coverage/**",
      "target/**"
    ]
  },
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx,js,mjs}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "error"
    }
  },
  {
    // Design-system gate (W2-02): apps must style via @erp/ui tokens, never hardcoded
    // hex colors. Scoped to migrated apps; widen this list as each app is migrated
    // onto the design system in W4-01 (module list-detail uplift).
    files: ["apps/booking/**/*.{ts,tsx}"],
    ignores: ["**/*.test.tsx", "**/*.test.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value=/#[0-9a-fA-F]{3,8}\\b/]",
          message: "Hardcoded hex colors are banned in apps — use @erp/ui design tokens (var(--erp-color-*)) instead."
        },
        {
          selector: "TemplateElement[value.raw=/#[0-9a-fA-F]{3,8}\\b/]",
          message: "Hardcoded hex colors are banned in apps — use @erp/ui design tokens (var(--erp-color-*)) instead."
        }
      ]
    }
  }
];
