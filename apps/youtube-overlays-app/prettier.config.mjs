/** @type {import('prettier').Config} */
const config = {
  printWidth: 120,
  semi: false,
  singleQuote: true,

  plugins: ['prettier-plugin-packagejson', 'prettier-plugin-organize-imports', 'prettier-plugin-tailwindcss'],

  overrides: [
    {
      files: 'tsconfig*.json',
      options: {
        parser: 'jsonc',
      },
    },
  ],
}

export default config
