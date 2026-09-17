/**
 * Shared Tailwind design tokens for apps/menu (mobile-first, per-restaurant
 * theming) and apps/admin (desktop-first dashboard). Each app extends this
 * preset in its own tailwind.config.ts.
 */
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
      },
      borderRadius: {
        sheet: "1.25rem",
      },
      boxShadow: {
        sheet: "0 -8px 30px rgba(0,0,0,0.12)",
        card: "0 2px 10px rgba(0,0,0,0.06)",
      },
      keyframes: {
        "slide-up": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
      },
      animation: {
        "slide-up": "slide-up 220ms ease-out",
        "fade-in": "fade-in 180ms ease-out",
      },
    },
  },
  plugins: [],
};
