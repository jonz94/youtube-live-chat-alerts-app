import baseConfig, { content } from '@-repo/tailwind-config'
import type { Config } from 'tailwindcss'

export default {
  content: [...content],
  presets: [baseConfig],
  theme: {
    extend: {},
  },
} satisfies Config
