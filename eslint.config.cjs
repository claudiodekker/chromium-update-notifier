const {
    defineConfig,
} = require("eslint/config");

const globals = require("globals");
const js = require("@eslint/js");

const {
    FlatCompat,
} = require("@eslint/eslintrc");

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

module.exports = defineConfig([{
    languageOptions: {
        globals: {
            ...globals.browser,
            ...globals.webextensions,
        },

        ecmaVersion: "latest",
        sourceType: "module",
        parserOptions: {},
    },

    extends: compat.extends("plugin:vue/recommended", "eslint:recommended"),

    rules: {
        indent: ["error", 2],
        quotes: ["warn", "single"],
        semi: ["warn", "never"],
        "comma-dangle": ["warn", "always-multiline"],

        "vue/max-attributes-per-line": ["warn", {
            "singleline": {
                "max": 9999,
            },

            "multiline": {
                "max": 9999,
            },
        }],
    },
}]);
