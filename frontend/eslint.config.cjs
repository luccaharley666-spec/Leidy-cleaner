// Flat configuration for ESLint (migration from .eslintrc.json)
module.exports = [
  // Global ignores (replaces .eslintignore)
  {
    ignores: [
      "public/**/*.js",
      "public/*.js",
      "node_modules/**",
      "out/**",
      "public_html/**",
      "public_html/_next/**",
      "coverage/**",
      ".next/**"
    ]
  },

  // Default rules for JS/TS/JSX/TSX files
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        ecmaFeatures: { jsx: true }
      },
      globals: {
        // browser globals
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        localStorage: "readonly",
        location: "readonly",
        fetch: "readonly",
        Headers: "readonly",
        Request: "readonly",
        Response: "readonly",
        FormData: "readonly",
        // node globals
        process: "readonly",
        Buffer: "readonly",
        global: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        module: "readonly",
        require: "readonly"
      }
    },
    rules: {
      "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "no-console": "off",
      "no-empty": ["warn", { "allowEmptyCatch": true }]
    }
  },

  // Tests override
  {
    files: ["**/*.test.js", "**/*.test.jsx", "**/*.spec.js", "**/*.spec.jsx"],
    languageOptions: {
      globals: {
        describe: "readonly",
        it: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        expect: "readonly",
        test: "readonly"
      }
    }
  },

  // Cypress globals
  {
    files: ["cypress/**/*.js", "cypress/**/*.jsx"],
    languageOptions: { globals: { cy: "readonly", Cypress: "readonly" } }
  }
];
