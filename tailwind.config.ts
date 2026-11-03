import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores base del sitio bylesther.dev
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
        // Colores personalizados igual al sitio principal
        // (sin 'border' para evitar conflicto con la definición base)
        canvas: "#09090E",
        surface: "#13141E",
        "surface-hover": "#1A1B28",
        "surface-elevated": "#1A1B28",
        "text-primary": "#FFFFFF",
        "text-secondary": "#94A3B8",
        "text-tertiary": "#94A3B8",
        "text-accent": "#C084FC",
        "kinetic-start": "#C026D3",
        "kinetic-end": "#D946EF",
        leather: "#A66E38",
        whatsapp: "#25D366",
        "gradient-kinetic": "linear-gradient(135deg, #C026D3 0%, #D946EF 100%)",
        "gradient-whatsapp": "linear-gradient(135deg, #059669 0%, #25D366 100%)",
        // Gray personalizado para reemplazar grayTheme de Tailwind v4
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
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};

export default config;