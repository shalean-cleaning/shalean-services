import { FlatCompat } from "@eslint/eslintrc";
import importPlugin from "eslint-plugin-import";
import unusedImports from "eslint-plugin-unused-imports";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    plugins: {
      "unused-imports": unusedImports,
      import: importPlugin,
    },
    rules: {
      "unused-imports/no-unused-imports": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
      "import/order": [
        "warn",
        {
          groups: [["builtin", "external"], ["internal", "parent", "sibling", "index"]],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      // Prevent inline remote URLs that can 404; enforce registry usage
      "no-restricted-syntax": [
        "warn",
        {
          selector:
            "JSXOpeningElement[name.name='Image'] JSXAttribute[name.name='src'] Literal[value=/^https?:\\/\\//]",
          message:
            "Use local images or the IMAGES registry + <SafeImage>. Inline remote URLs are disallowed.",
        },
        {
          selector:
            "ImportDeclaration[source.value='next/image'] ImportSpecifier[imported.name='Image']",
          message:
            "Use the default import: `import Image from \"next/image\"` (no named import).",
        },
      ],
    },
  },
];

export default eslintConfig;
