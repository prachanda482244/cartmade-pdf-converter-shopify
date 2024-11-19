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
      animation: {
        bookFlip: "bookFlip 1s ease-in-out",
        slideIn: "slideIn 1s ease-out",
        fadeIn: "fadeIn 1s ease-out",
        bounce: "bounce 1s infinite",
        rotate: "rotate 1s linear infinite",
      },
      keyframes: {
        bookFlip: {
          "0%": { transform: "rotateY(0deg)" },
          "100%": { transform: "rotateY(180deg)" },
        },
        slideIn: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        bounce: {
          "0%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
          "100%": { transform: "translateY(0)" },
        },
        rotate: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
