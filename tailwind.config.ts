import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      perspective: {
        1000: "1000px",
      },
      transformOrigin: {
        "top-right": "top right",
      },
    },
  },
  plugins: [],
} satisfies Config;
