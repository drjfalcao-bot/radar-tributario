import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        petroleum: {
          50: "#eef7f5",
          100: "#d5ebe6",
          500: "#0f766e",
          700: "#0f3d3e",
          900: "#0b2424",
        },
        ink: "#18211f",
      },
      boxShadow: {
        panel: "0 18px 45px rgba(16, 24, 20, 0.08)",
      },
    },
  },
  plugins: [],
} satisfies Config;
