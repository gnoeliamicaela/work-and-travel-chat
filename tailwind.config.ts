import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        terracota: {
          50: "#FDF3EE",
          100: "#FAE3D6",
          200: "#F3C2A3",
          300: "#EB9F6E",
          400: "#DC7842",
          500: "#C1541C",
          600: "#A34417",
          700: "#803513",
          800: "#5C270E",
          900: "#3D1A0A",
        },
        marino: {
          50: "#EEF2F6",
          100: "#D3DEE9",
          200: "#A7BDD3",
          300: "#7B9BBC",
          400: "#4F7AA6",
          500: "#1F3A5F",
          600: "#1A314F",
          700: "#14273F",
          800: "#0F1D2F",
          900: "#0A1420",
        },
        mostaza: {
          50: "#FDF6E7",
          100: "#FAEAC2",
          200: "#F3D584",
          300: "#ECC046",
          400: "#E3A72F",
          500: "#C68A1F",
          600: "#9E6D19",
        },
        arena: {
          50: "#FBF7F2",
          100: "#F5EDE2",
        },
        carbon: {
          800: "#241C15",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [typography],
};

export default config;
