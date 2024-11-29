import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

export default tseslint.config({
    extends: [js.configs.recommended, ...tseslint.configs.recommended, eslintConfigPrettier, eslintPluginPrettierRecommended],
    files: ["src/**/*.{ts,tsx,js}"],
    ignores: ["dist", "node_modules"],
    languageOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        globals: {
            ...globals.browser,
            ...globals.node,
            // myCustomGlobal: "readonly"
        },
    },
    plugins: {
        //
    },
    rules: {
        "prettier/prettier": "warn", // 默认为 error
        "arrow-body-style": "off",
        "prefer-arrow-callback": "off",

        "@typescript-eslint/no-explicit-any": "off", // allow any type
    },
});
