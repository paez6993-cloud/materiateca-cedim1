import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "Georgia", "serif"],
      },
      colors: {
        // Paleta editorial sobria
        cedar: {
          50: "#faf9f7",
          100: "#f3f1ec",
          200: "#e8e3d8",
          300: "#d4ccbc",
          400: "#b8ac98",
          500: "#9e9079",
          600: "#857763",
          700: "#6e6151",
          800: "#5a5043",
          900: "#3d3730",
        },
        ink: "#1a1816",
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
      },
      maxWidth: {
        "8xl": "88rem",
      },
    },
  },
  plugins: [],
};

export default config;
