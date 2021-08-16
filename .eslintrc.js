module.exports = {
  env: {
    browser: true,
    node: true,
    jest: true,
    es2020: true,
  },
  globals: {
    browser: 'readonly',
    page: 'readonly',
    Api: 'readonly',
    pipes: 'readonly',
    mockApi: 'readonly',
    SimplifiedFetch: 'readonly',
  },
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-ts-comment': 'warn',
  },
  overrides: [
    {
      files: ['test/**/*.js',],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        // shouldn't enable when test without NoRequest
        'no-empty': ['error', { "allowEmptyCatch": true }],
      }
    },
  ],
};