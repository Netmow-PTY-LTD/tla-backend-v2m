import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
      'no-undef': 'off', // TypeScript handles this better
      'prefer-const': 'error',
      'no-console': 'warn',
    },
  },
  {
    ignores: ['**/node_modules/', '**/dist/'],
  },
);
