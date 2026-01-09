/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Purple/Blue dark theme
        dark: {
          bg: '#0f0a1a',           // Deep purple-black
          surface: '#1a1425',      // Dark purple surface
          'surface-light': '#251d35', // Lighter purple surface
          border: '#3d2e5a',       // Purple-tinted border
        },
        // Primary (indigo/purple)
        primary: {
          DEFAULT: '#7c3aed',      // Vibrant purple
          hover: '#6d28d9',
          light: '#a78bfa',
        },
        // Accent (cyan/teal)
        accent: {
          DEFAULT: '#06b6d4',      // Cyan
          hover: '#0891b2',
          light: '#22d3ee',
        },
        // Secondary accent (light purple)
        secondary: {
          DEFAULT: '#a855f7',      // Purple
          hover: '#9333ea',
          light: '#c084fc',
        },
        // Text colors
        text: {
          primary: '#f1f5f9',
          secondary: '#cbd5e1',
          muted: '#94a3b8',
        },
        // Status colors
        danger: {
          DEFAULT: '#ef4444',
          hover: '#dc2626',
        },
        warning: '#fbbf24',
        success: '#22c55e',
      },
    },
  },
  plugins: [],
}
