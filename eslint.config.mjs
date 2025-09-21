import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  js.configs.recommended,
  {
    ignores: [
      "node_modules/**", 
      ".next/**", 
      "dist/**", 
      "build/**",
      "**/.next/**",
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      ".next/static/**",
      "**/.next/static/**"
    ],
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    ignores: [
      "node_modules/**", 
      ".next/**", 
      "dist/**", 
      "build/**",
      "**/.next/**",
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      ".next/static/**",
      "**/.next/static/**"
    ],
    plugins: {
      "@next/next": nextPlugin,
      "@typescript-eslint": tseslint,
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        URL: "readonly",
        fetch: "readonly",
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        location: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        module: "readonly",
        require: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        global: "readonly",
        self: "readonly",
        importScripts: "readonly",
        WebAssembly: "readonly",
        Blob: "readonly",
        btoa: "readonly",
        atob: "readonly",
        HTMLDivElement: "readonly",
        Image: "readonly",
      },
    },
    rules: {
      // Next.js defaults
      "@next/next/no-html-link-for-pages": "off",

      // Prevent named imports of Image from next/image
      "no-restricted-syntax": [
        "warn",
        {
          selector: 'ImportDeclaration[source.value="next/image"] ImportSpecifier[imported.name="Image"]',
          message:
            "Use the default import: `import Image from \"next/image\"` (no named import).",
        },
      ],

      // TypeScript/React specific rules
      "no-unused-vars": "off", // Turn off base rule
      "@typescript-eslint/no-unused-vars": ["error", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "ignoreRestSiblings": true 
      }],
      "@typescript-eslint/no-explicit-any": "warn",
      
      // React specific
      "react/react-in-jsx-scope": "off", // Not needed in Next.js 13+
      "react/prop-types": "off", // Using TypeScript instead
      
      // General
      "no-console": "warn",
      "no-empty": "error",
      "no-empty-pattern": "error",
      "no-constant-condition": "error",
      "no-cond-assign": "error",
      
      // Jest/Testing
      "no-undef": "off", // TypeScript handles this
    },
  },
  // Test files configuration
  {
    files: ["**/*.test.{js,jsx,ts,tsx}", "**/__tests__/**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      globals: {
        ...js.configs.recommended.globals,
        jest: "readonly",
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off", // Allow any in tests
    },
  },
  // Supabase Edge Functions configuration
  {
    files: ["supabase/functions/**/*.ts"],
    languageOptions: {
      globals: {
        Deno: "readonly",
        Response: "readonly",
        Request: "readonly",
      },
    },
  },
  // Scripts and API routes configuration
  {
    files: ["scripts/**/*.js", "scripts/**/*.ts", "src/app/api/**/*.ts", "create-favicon.js", "src/lib/**/*.ts", "src/server/**/*.ts", "supabase/functions/**/*.ts", "src/components/**/*.tsx", "src/hooks/**/*.ts", "src/app/**/*.tsx"],
    rules: {
      "no-console": "off", // Allow console in scripts, API routes, lib, server, edge functions, components, hooks, and pages
      "@typescript-eslint/no-explicit-any": "off", // Allow any in API routes and lib files
    },
  },
  // Test files configuration - allow console and relaxed rules
  {
    files: ["test-*.js", "**/test-*.js"],
    rules: {
      "no-console": "off", // Allow console in test files
      "@typescript-eslint/no-unused-vars": "off", // Allow unused vars in test files
      "@typescript-eslint/no-explicit-any": "off", // Allow any in test files
    },
  },
];