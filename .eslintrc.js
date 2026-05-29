module.exports = {
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  env: {
    browser: true,
    es6: true,
  },
  extends: ['prettier', 'plugin:vue/vue3-recommended'],
  plugins: ['prettier', 'vue'],
  rules: {
    'vue/require-default-prop': 'off',
    'prettier/prettier': [
      'error',
      {
        bracketSpacing: true,
        endOfLine: 'auto',
        singleQuote: true,
      },
    ],
  },
};
