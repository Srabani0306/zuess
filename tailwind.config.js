/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#101B33",
        "ink-soft": "#1B2A4A",
        // paper: "#F3F1E9",
        // "paper-dim": "#EAE7DA",
          paper: "#e9f3ee",
          "paper-dim": "rgb(228 235 229)",
        line: "#D6D1BF",
        emerald: {
          DEFAULT: "#1F6F54",
          dark: "#154F3C",
          light: "#EAF3EF",
        },
        gold: {
          DEFAULT: "#C0954A",
          light: "#F3E8D2",
        },
        charcoal: "#20232B",
      },
      fontFamily: {
        serif: ["Fraunces", "ui-serif", "Georgia", "serif"],
        sans: ["Manrope", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      maxWidth: {
        content: "1240px",
      },
      keyframes: {
        drawline: {
          "0%": { strokeDashoffset: "1" },
          "100%": { strokeDashoffset: "0" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-12px) rotate(6deg)" },
        },
        sequentialFlow: {
          "0%": { transform: "scaleX(0)", opacity: "0" },
          "8%": { opacity: "1" },
          "22%": { transform: "scaleX(1)", opacity: "1" },
          "32%": { transform: "scaleX(1)", opacity: "0" },
          "100%": { transform: "scaleX(1)", opacity: "0" },
        },
        pulseScale: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.25" },
          "50%": { transform: "scale(1.3)", opacity: "0.4" },
        },
        drift: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "33%": { transform: "translate(3%, -4%)" },
          "66%": { transform: "translate(-3%, 3%)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        bubbleRise: {
          "0%": { transform: "translateY(0) translateX(0)", opacity: "0" },
          "12%": { opacity: "0.55" },
          "88%": { opacity: "0.35" },
          "100%": { transform: "translateY(-115vh) translateX(24px)", opacity: "0" },
        },
      },
      animation: {
        drawline: "drawline 0.8s ease-out forwards",
        fadeUp: "fadeUp 0.6s ease-out both",
        fadeIn: "fadeIn 0.45s ease-out both",
        float: "float 5.5s ease-in-out infinite",
        "float-slow": "floatSlow 8s ease-in-out infinite",
        "float-delayed": "floatSlow 9s ease-in-out infinite 2s",
        "sequential-flow": "sequentialFlow 3.6s ease-in-out infinite",
        "pulse-scale": "pulseScale 9s ease-in-out infinite",
        "pulse-scale-slow": "pulseScale 13s ease-in-out infinite",
        drift: "drift 20s ease-in-out infinite",
        "drift-slow": "drift 28s ease-in-out infinite",
        "bubble-rise": "bubbleRise linear infinite",
        blink: "blink 1s step-start infinite",
      },
    },
  },
  plugins: [],
};
