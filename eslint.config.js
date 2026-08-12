const path = require("node:path");
const globals = require("globals");
const tseslint = require("typescript-eslint");
const reactHooks = require("eslint-plugin-react-hooks");
const reactRefreshModule = require("eslint-plugin-react-refresh");
const eslintConfigPrettier = require("eslint-config-prettier");

const reactRefresh =
  reactRefreshModule.default ||
  reactRefreshModule.reactRefresh ||
  reactRefreshModule;

const tsTypeCheckedConfigs = tseslint.configs.recommendedTypeChecked.map(
  (config) => ({
    ...config,
    files: ["client/src/**/*.{ts,tsx}", "server/src/**/*.ts"],
    languageOptions: {
      ...config.languageOptions,
      parserOptions: {
        ...config.languageOptions?.parserOptions,
        projectService: true,
        tsconfigRootDir: path.resolve(__dirname),
      },
    },
  }),
);

module.exports = [
  {
    ignores: ["**/dist/**", "**/node_modules/**"],
  },
  ...tsTypeCheckedConfigs,
  {
    files: ["client/src/**/*.{ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs["recommended-latest"].rules,
      ...reactRefresh.configs.vite.rules,
    },
  },
  {
    files: ["server/src/**/*.ts"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },
  eslintConfigPrettier,
];
