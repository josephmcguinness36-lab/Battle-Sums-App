
import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['Inter', 'sans-serif'],
        headline: ['Inter', 'sans-serif'],
        code: ['monospace'],
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
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'twinkle': {
            '0%, 100%': { transform: 'scale(1)', opacity: '1' },
            '50%': { transform: 'scale(1.2)', opacity: '0.7' },
        },
        'level-up': {
            '0%': { transform: 'scale(0.5)', opacity: '0' },
            '50%': { transform: 'scale(1.2)', opacity: '1' },
            '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'fade-in': {
            '0%': { opacity: '0' },
            '100%': { opacity: '1' },
        },
        'ping-slow': {
          '0%': {
            transform: 'scale(1.5)',
            opacity: '1',
          },
          '100%': {
            transform: 'scale(2.5)',
            opacity: '0',
          },
        },
        'correct-answer': {
            '0%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(45, 212, 191, 0.4)' },
            '70%': { transform: 'scale(1.05)', boxShadow: '0 0 0 15px rgba(45, 212, 191, 0)' },
            '100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(45, 212, 191, 0)' },
        },
        'explosion': {
          '0%': { boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.7)' },
          '70%': { boxShadow: '0 0 0 10px rgba(239, 68, 68, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(239, 68, 68, 0)' },
        },
        'hit-glow': {
            '0%, 100%': { filter: 'drop-shadow(0 0 3px hsl(var(--primary-foreground)))' },
            '50%': { filter: 'drop-shadow(0 0 6px hsl(var(--primary-foreground)))' },
        },
        'targeting': {
            '0%': { transform: 'scale(2)', opacity: '0' },
            '50%': { opacity: '0.5' },
            '100%': { transform: 'scale(1)', opacity: '0' },
        },
        'flashing': {
            '0%, 100%': { opacity: '1' },
            '50%': { opacity: '0.2' },
        },
        'slide-out-answer': {
            '0%': { transform: 'translateY(100%)', opacity: '0' },
            '50%': { transform: 'translateY(0)', opacity: '1' },
            '100%': { transform: 'translateY(-100%)', opacity: '0' },
        },
        'answer-reveal': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'twinkle': 'twinkle 1s ease-in-out infinite',
        'level-up': 'level-up 0.8s ease-out forwards',
        'fade-in': 'fade-in 0.5s ease-in',
        'ping-slow': 'ping-slow 1s cubic-bezier(0, 0, 0.2, 1) forwards',
        'correct-answer': 'correct-answer 0.6s ease-out',
        'explosion': 'explosion 1s ease-in-out',
        'hit-glow': 'hit-glow 1.5s ease-in-out infinite',
        'targeting': 'targeting 1s ease-out',
        'flashing': 'flashing 0.7s ease-in-out infinite',
        'slide-out-answer': 'slide-out-answer 1s ease-in-out forwards',
        'answer-reveal': 'answer-reveal 0.5s ease-out forwards',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;

    