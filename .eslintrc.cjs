module.exports = {
  env: {
    browser: true,
    webextensions: true
  },
  extends: [
    'plugin:vue/vue3-recommended',
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: 'module',
  },
  rules: {
    indent: ['error', 2],
    quotes: ['warn', 'single'],
    semi: ['warn', 'never'],
    'comma-dangle': ['warn', 'always-multiline'],
    'vue/max-attributes-per-line': ['warn', {
      "singleline": {
        "max": 9999
      },
      "multiline": {
        "max": 9999
      }
    }],
  }
}
