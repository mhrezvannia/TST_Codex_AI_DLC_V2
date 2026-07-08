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
  }
];
