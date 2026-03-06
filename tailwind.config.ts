import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        midnight: "#0B1121", deep: "#111827", surface: "#1A2332",
        "surface-light": "#243044", border: "#2D3F56", "border-light": "#3A5068",
        accent: "#22D3A7", "accent-dim": "#1A9E7E",
        warm: "#F59E0B", coral: "#FB7185", sky: "#38BDF8", violet: "#A78BFA",
      },
      fontFamily: {
        display: ["DM Sans", "sans-serif"],
        body: ["DM Sans", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease-out forwards",
        "fade-in": "fadeIn 0.4s ease-out forwards",
        "slide-right": "slideRight 0.4s ease-out forwards",
        "scale-in": "scaleIn 0.3s ease-out forwards",
        glow: "glow 3s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: { from: { opacity: "0", transform: "translateY(16px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideRight: { from: { opacity: "0", transform: "translateX(-20px)" }, to: { opacity: "1", transform: "translateX(0)" } },
        scaleIn: { from: { opacity: "0", transform: "scale(0.95)" }, to: { opacity: "1", transform: "scale(1)" } },
        glow: { "0%, 100%": { boxShadow: "0 0 20px rgba(34,211,167,0.1)" }, "50%": { boxShadow: "0 0 40px rgba(34,211,167,0.2)" } },
      },
    },
  },
  plugins: [],
};
export default config;
