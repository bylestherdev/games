import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Colores base iguales al sitio principal bylesther.dev
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        // Colores personalizados para reemplazar el gray theme de Tailwind
        gray: {
          0: "hsl(var(--gray-0, 0 0% 100%))",
          100: "hsl(var(--gray-100, 0 0% 96%))",
          200: "hsl(var(--gray-200, 0 0% 90%))",
          300: "hsl(var(--gray-300, 0 0% 84%))",
          400: "hsl(var(--gray-400, 0 0% 78%))",
          500: "hsl(var(--gray-500, 0 0% 70%))",
          600: "hsl(var(--gray-600, 0 0% 60%))",
          700: "hsl(var(--gray-700, 0 0% 50%))",
          800: "hsl(var(--gray-800, 0 0% 40%))",
          900: "hsl(var(--gray-900, 0 0% 30%))",
          950: "hsl(var(--gray-950, 0 0% 10%))",
        },
      },
    },
  },
  plugins: [],
};

export default config;