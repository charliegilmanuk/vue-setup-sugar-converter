module.exports = {
  root: true,

  globals: {
    defineProps: "readonly",
    defineEmits: "readonly",
    defineExpose: "readonly",
    withDefaults: "readonly"
  },

  env: {
    node: true,
  },

  plugins: ['prettier', 'vue'],

  extends: ['eslint:recommended', 'plugin:prettier/recommended', 'plugin:vue/vue3-recommended'],

  parserOptions: {
    parser: '@babel/eslint-parser',
    ecmaVersion: 2018,
    sourceType: 'module',
  },

  rules: {
    'no-console': 0,
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'prefer-promise-reject-errors': 'off',
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
    'no-unused-vars': 1,
    'arrow-parens': 0,
    'one-var': 0,
  },
};
