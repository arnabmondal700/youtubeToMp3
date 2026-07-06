import angular from '@angular-eslint/eslint-plugin';
import template from '@angular-eslint/eslint-plugin-template';
import parser from '@angular-eslint/template-parser';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

export default [
  {
    ignores: [
      '/e2e/**',
      '/node_modules/**',
      '/dist/**',
      '/youtube-to-mp3/**',
    ],
  },
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.app.json',
      },
    },
    plugins: {
      '@angular-eslint': angular,
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...angular.configs['recommended'].rules,
      ...tsPlugin.configs['recommended'].rules,
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    files: ['src/**/*.html'],
    languageOptions: {
      parser,
    },
    plugins: {
      '@angular-eslint/template': template,
    },
    rules: {
      ...template.configs['recommended'].rules,
    },
  },
];
