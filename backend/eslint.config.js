import js from '@eslint/js';

export default [
  {
    ignores: [
      'node_modules/',
      'dist/',
      'coverage/',
      '.next/',
      'migrations/',
      'seeds/',
      '__tests__/',
      'test/',
      'e2e/',
      'scripts/'
    ]
  },
  {
    // ESM config files
    files: ['eslint.config.js'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: false
        }
      }
    },
    rules: {
      'no-undef': 'off'
    }
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'commonjs',
      parserOptions: {
        ecmaFeatures: {
          jsx: false
        }
      },
      globals: {
        // Node.js built-ins
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        setInterval: 'readonly',
        setTimeout: 'readonly',
        clearInterval: 'readonly',
        clearTimeout: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        fetch: 'readonly',
        
        // Additional Node.js globals
        URL: 'readonly',
        URLSearchParams: 'readonly',
        TextEncoder: 'readonly',
        TextDecoder: 'readonly',
        clearImmediate: 'readonly',
        setImmediate: 'readonly',
        queueMicrotask: 'readonly'
      }
    },
    rules: {
      // Turn off no-undef for lenient parsing
      'no-undef': 'off',
      'constructor-super': 'error',
      'for-direction': 'error',
      'getter-return': 'error',
      '[REDACTED_TOKEN]': 'error',
      'no-class-assign': 'error',
      'no-compare-neg-zero': 'error',
      'no-cond-assign': 'error',
      'no-const-assign': 'error',
      '[REDACTED_TOKEN]': 'warn',
      'no-control-regex': 'warn',
      'no-debugger': 'warn',
      'no-delete-var': 'error',
      'no-dupe-args': 'error',
      '[REDACTED_TOKEN]': 'error',
      'no-dupe-else-if': 'error',
      'no-dupe-keys': 'error',
      'no-duplicate-case': 'error',
      '[REDACTED_TOKEN]': 'warn',
      'no-empty-pattern': 'warn',
      'no-ex-assign': 'error',
      '[REDACTED_TOKEN]': 'warn',
      'no-extra-semi': 'warn',
      'no-fallthrough': 'warn',
      'no-func-assign': 'error',
      'no-import-assign': 'error',
      '[REDACTED_TOKEN]': 'warn',
      'no-invalid-regexp': 'error',
      '[REDACTED_TOKEN]': 'warn',
      '[REDACTED_TOKEN]': 'error',
      '[REDACTED_TOKEN]': 'warn',
      '[REDACTED_TOKEN]': 'warn',
      'no-new-symbol': 'error',
      '[REDACTED_TOKEN]': 'warn',
      'no-obj-calls': 'error',
      'no-octal': 'error',
      '[REDACTED_TOKEN]': 'warn',
      'no-redeclare': 'error',
      'no-regex-spaces': 'warn',
      'no-setter-return': 'error',
      '[REDACTED_TOKEN]': 'error',
      'no-sparse-arrays': 'warn',
      '[REDACTED_TOKEN]': 'error',
      'no-unreachable': 'warn',
      'no-unsafe-finally': 'error',
      'no-unsafe-negation': 'warn',
      '[REDACTED_TOKEN]': 'warn',
      'no-unused-labels': 'warn',
      'no-useless-catch': 'warn',
      'no-useless-escape': 'warn',
      'no-with': 'error',
      'require-yield': 'error',
      'use-isnan': 'error',
      'valid-typeof': 'error',
      
      // Stylistic rules (warnings only, not errors)
      'no-console': ['warn', { allow: ['warn', 'error', 'log'] }],
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-empty': ['warn', { allowEmptyCatch: true }],
      'semi': 'off',
      'quotes': 'off',
      'indent': 'off',
      'prefer-const': 'off',
      'no-var': 'off'
    }
  }
];
