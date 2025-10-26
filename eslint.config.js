/* eslint-disable @typescript-eslint/no-require-imports */
const eslint = require("@eslint/js");
const tseslint = require("@typescript-eslint/eslint-plugin");
const tsparser = require("@typescript-eslint/parser");
const importPlugin = require("eslint-plugin-import");

module.exports = [
    {
        ignores: ["dist/**", "**/*.md", "eslint.config.js"]
    },
    eslint.configs.recommended,
    {
        files: ["**/*.ts", "**/*.tsx", "**/*.js"],
        languageOptions: {
            parser: tsparser,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module"
            },
            globals: {
                // Node.js globals
                console: "readonly",
                process: "readonly",
                __dirname: "readonly",
                __filename: "readonly",
                require: "readonly",
                module: "readonly",
                exports: "readonly",
                Buffer: "readonly",
                setTimeout: "readonly",
                clearTimeout: "readonly",
                setInterval: "readonly",
                clearInterval: "readonly",
                setImmediate: "readonly",
                clearImmediate: "readonly",
                global: "readonly",
                // Modern Web/Node APIs
                fetch: "readonly",
                URL: "readonly",
                URLSearchParams: "readonly",
                Response: "readonly",
                Request: "readonly",
                RequestInfo: "readonly",
                Headers: "readonly",
                CloseEvent: "readonly",
                // Node.js namespace
                NodeJS: "readonly"
            }
        },
        plugins: {
            "@typescript-eslint": tseslint,
            "import": importPlugin
        },
        rules: {
            ...tseslint.configs.recommended.rules,
            ...importPlugin.configs.recommended.rules,
            ...importPlugin.configs.typescript.rules,
            "quotes": ["error", "double"],
            "object-curly-spacing": ["error", "always"],
            "indent": ["error", 4],
            "no-mixed-spaces-and-tabs": "off",
            "no-redeclare": "off",
            "@typescript-eslint/no-redeclare": "off",
            "@typescript-eslint/no-explicit-any": "off"
        },
        settings: {
            "import/resolver": {
                typescript: true,
                node: true
            }
        }
    }
];
