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
        gov: {
          blue: "#1e3a5f",
          "blue-dark": "#152d4a",
          "blue-light": "#2c5282",
          saffron: "#ff9933",
          "saffron-dark": "#e68a00",
          green: "#138808",
          "green-dark": "#0f6b06",
          white: "#ffffff",
          gray: "#f5f5f5",
          "gray-dark": "#e0e0e0",
          "gray-darker": "#9ca3af",
          "text-dark": "#1f2937",
          "text-light": "#6b7280",
          border: "#d1d5db",
          "header-start": "#1e3a5f",
          "header-end": "#152d4a",
        },
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        gov: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        "gov-lg":
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
