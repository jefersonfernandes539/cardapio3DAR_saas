/**
 * Reference ESLint rules shared conceptually across both apps.
 *
 * NOT consumed via `extends` from apps/*/.eslintrc.json: ESLint 8's legacy
 * config resolver doesn't reliably resolve `extends` strings that point to a
 * *subpath* of a scoped package (`@cardapio/config/eslint-preset.js`) across
 * pnpm's symlinked workspace packages. Each app therefore duplicates this
 * tiny config directly in its own `.eslintrc.json`. If/when the repo moves
 * to ESLint 9 flat config, this file can become a real shared flat config
 * (`packages/config/eslint.config.js`) imported with a normal JS import.
 */
module.exports = {
  root: true,
  extends: ["next/core-web-vitals"],
  rules: {
    "@next/next/no-img-element": "off",
  },
};
