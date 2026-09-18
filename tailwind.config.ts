import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#F2F3F6",
        "ink-soft": "#8B90A0",
        paper: "#14161C",
        "paper-soft": "#1D2029",
        line: "#2A2E38",
        gold: "#F5B942",
        income: "#3ED9B0",
        expense: "#E5675B",
      },
      borderRadius: {
        card: "14px",
      },
    },
  },
  plugins: [],
};
export default config;
