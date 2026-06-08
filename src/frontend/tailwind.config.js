import typography from "@tailwindcss/typography";
import containerQueries from "@tailwindcss/container-queries";
import animate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["index.html", "src/**/*.{js,ts,jsx,tsx,html,css}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "oklch(var(--border))",
        input: "oklch(var(--input))",
        ring: "oklch(var(--ring) / <alpha-value>)",
        background: "oklch(var(--background))",
        foreground: "oklch(var(--foreground))",
        primary: {
          DEFAULT: "oklch(var(--primary) / <alpha-value>)",
          foreground: "oklch(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "oklch(var(--secondary) / <alpha-value>)",
          foreground: "oklch(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "oklch(var(--destructive) / <alpha-value>)",
          foreground: "oklch(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "oklch(var(--muted) / <alpha-value>)",
          foreground: "oklch(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "oklch(var(--accent) / <alpha-value>)",
          foreground: "oklch(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "oklch(var(--popover))",
          foreground: "oklch(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "oklch(var(--card))",
          foreground: "oklch(var(--card-foreground))",
        },
        chart: {
          1: "oklch(var(--chart-1))",
          2: "oklch(var(--chart-2))",
          3: "oklch(var(--chart-3))",
          4: "oklch(var(--chart-4))",
          5: "oklch(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "oklch(var(--sidebar))",
          foreground: "oklch(var(--sidebar-foreground))",
          primary: "oklch(var(--sidebar-primary))",
          "primary-foreground": "oklch(var(--sidebar-primary-foreground))",
          accent: "oklch(var(--sidebar-accent))",
          "accent-foreground": "oklch(var(--sidebar-accent-foreground))",
          border: "oklch(var(--sidebar-border))",
          ring: "oklch(var(--sidebar-ring))",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgba(0,0,0,0.05)",
        subtle: "0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.2)",
        glow: "0 0 20px rgba(0, 217, 255, 0.4)",
        "glow-lg": "0 0 40px rgba(0, 217, 255, 0.3)",
        "glow-purple": "0 0 20px rgba(189, 0, 255, 0.4), 0 0 40px rgba(189, 0, 255, 0.2)",
        "glow-magenta": "0 0 20px rgba(255, 0, 107, 0.4), 0 0 40px rgba(255, 0, 107, 0.2)",
        "glass": "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6", boxShadow: "0 0 8px rgba(100, 100, 120, 0.3)" },
          "50%": { opacity: "0.8", boxShadow: "0 0 16px rgba(100, 100, 120, 0.5)" },
        },
        "slide-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "gradient-drift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "stars-drift": {
          "from": { transform: "translateY(0) translateX(0)" },
          "to": { transform: "translateY(-600px) translateX(-200px)" },
        },
        "logo-pulse": {
          "0%, 100%": { boxShadow: "0 0 8px rgba(0, 217, 255, 0.5), 0 0 16px rgba(0, 217, 255, 0.2)" },
          "50%": { boxShadow: "0 0 16px rgba(0, 217, 255, 0.8), 0 0 32px rgba(0, 217, 255, 0.4), 0 0 64px rgba(0, 217, 255, 0.1)" },
        },
        "nav-scan": {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        "center-pulse": {
          "0%, 100%": { boxShadow: "0 0 8px rgba(0, 217, 255, 0.5), inset 0 0 8px rgba(0, 217, 255, 0.2)", transform: "translate(-50%, -50%) scale(1)" },
          "50%": { boxShadow: "0 0 20px rgba(0, 217, 255, 0.8), inset 0 0 12px rgba(0, 217, 255, 0.3)", transform: "translate(-50%, -50%) scale(1.05)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "slide-in": "slide-in 0.4s ease-out",
        "gradient-drift": "gradient-drift 15s ease-in-out infinite",
        "stars-drift": "stars-drift 60s linear infinite",
        "logo-pulse": "logo-pulse 3s ease-in-out infinite",
        "nav-scan": "nav-scan 2s linear infinite",
        "center-pulse": "center-pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [typography, containerQueries, animate],
};
