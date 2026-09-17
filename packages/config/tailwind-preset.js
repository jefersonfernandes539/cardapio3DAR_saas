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
        // Warm neutral scale (replaces Tailwind's default cool-blue gray)
        // used everywhere via `gray-*` utilities — sits better next to the
        // orange brand color than the default palette does.
        gray: {
          50: "#faf9f7",
          100: "#f2f0ec",
          200: "#e6e2da",
          300: "#d3ccc0",
          400: "#a89e8e",
          500: "#83786a",
          600: "#645a4e",
          700: "#4d453b",
          800: "#332d26",
          900: "#211d18",
          950: "#141210",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sheet: "1.5rem",
      },
      boxShadow: {
        // Soft, warm-tinted ambient shadow for resting cards.
        card: "0 1px 2px rgba(51,45,38,0.04), 0 8px 24px -12px rgba(51,45,38,0.12)",
        // Slightly stronger — hover/press states and floating controls.
        elevated: "0 4px 10px rgba(51,45,38,0.06), 0 16px 32px -12px rgba(51,45,38,0.18)",
        sheet: "0 -12px 40px rgba(51,45,38,0.16)",
        glow: "0 8px 24px -8px rgba(234,88,12,0.45)",
      },
      backgroundImage: {
        "brand-radial":
          "radial-gradient(120% 120% at 15% 0%, var(--tw-gradient-stops))",
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
        "scale-in": {
          from: { opacity: 0, transform: "scale(0.96)" },
          to: { opacity: 1, transform: "scale(1)" },
        },
      },
      animation: {
        "slide-up": "slide-up 260ms cubic-bezier(0.22,1,0.36,1)",
        "fade-in": "fade-in 180ms ease-out",
        "scale-in": "scale-in 180ms cubic-bezier(0.22,1,0.36,1)",
      },
    },
  },
  plugins: [],
};
