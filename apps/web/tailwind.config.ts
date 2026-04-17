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
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      colors: {
        coral:       "var(--coral)",
        "coral-bg":  "var(--coral-bg)",
        "coral-mid": "var(--coral-mid)",
        ink:         "var(--ink)",
        "ink-mid":   "var(--ink-mid)",
        "ink-light": "var(--ink-light)",
        bg:          "var(--bg)",
        "bg-warm":   "var(--bg-warm)",
        "bg-warm2":  "var(--bg-warm2)",
        border:      "var(--border)",
        "border-mid":"var(--border-mid)",
        success:     "var(--success)",
        "success-bg":"var(--success-bg)",
      },
      borderColor: {
        DEFAULT:     "var(--border)",
        mid:         "var(--border-mid)",
        strong:      "var(--border-strong)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
    },
  },
  plugins: [],
};
export default config;
