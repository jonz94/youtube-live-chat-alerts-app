module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    '@electron-toolkit/eslint-config-ts/recommended',
  ],
  settings: { react: { version: '18.3' } },
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
  },
}
