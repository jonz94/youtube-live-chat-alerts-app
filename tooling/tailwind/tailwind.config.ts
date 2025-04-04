import type { Config } from 'tailwindcss'
import tailwindcssAnimate from 'tailwindcss-animate'
import { fontFamily } from 'tailwindcss/defaultTheme'
import plugin from 'tailwindcss/plugin'

export const content = ['./index.html', './src/**/*.{ts,tsx}'] as const

export default {
  darkMode: ['class'],
  content: [...content],
  theme: {
    fontFamily: {
      pixel: [
        '"Cubic 11"',
        '"Noto Sans TC"',
        '"Noto Sans JP"',
        '"Noto Sans KR"',
        '"Noto Sans SC"',
        '"Source Han Sans TC"',
        '"Source Han Sans JP"',
        '"Source Han Sans KR"',
        '"Source Han Sans SC"',
        '"微軟正黑體"',
        ...fontFamily.sans,
      ],
    },
    extend: {
      fontFamily: {
        sans: [
          '"Noto Sans TC"',
          '"Noto Sans JP"',
          '"Noto Sans KR"',
          '"Noto Sans SC"',
          '"Source Han Sans TC"',
          '"Source Han Sans JP"',
          '"Source Han Sans KR"',
          '"Source Han Sans SC"',
          '"微軟正黑體"',
          ...fontFamily.sans,
        ],
      },
      screens: {
        xs: '480px',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
    },
  },
  plugins: [
    tailwindcssAnimate,
    plugin(({ addUtilities }) => {
      addUtilities({
        '.text-shadow': {
          'text-shadow': [
            '0px 0px 1px black',
            '0px 0px 2px black',
            '0px 0px 3px black',
            '0px 0px 4px black',
            '0px 0px 5px black',
          ].join(', '),
        },
      })
    }),
  ],
} satisfies Config
