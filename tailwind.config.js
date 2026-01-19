/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "var(--semantic-color-brand-primary)",
        },
        bg: {
          page: "var(--semantic-color-bg-page)",
          card: "var(--semantic-color-bg-card)",
        },
        text: {
          DEFAULT: "var(--semantic-color-text-default)",
          muted: "var(--semantic-color-text-muted)",
        },
        border: {
          DEFAULT: "var(--semantic-color-border-default)",
        },
        success: "var(--semantic-color-success)",
        danger: "var(--semantic-color-danger)",
        soft: {
          bg: "var(--semantic-color-soft-bg)",
          fg: "var(--semantic-color-soft-fg)",
        },
      },

      borderRadius: {
        control: "var(--radius-control)",
        card: "var(--radius-card)",
      },

      // spacing match spec 4 / 8 / 16 / 24 / 32
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
      },

      fontFamily: {
        sans: ["Inter", "system-ui", "Arial", "sans-serif"],
      },

      // ✅ Typo semantic – 1 nguồn duy nhất
      fontSize: {
        h1: ["24px", { lineHeight: "32px", fontWeight: "700" }],
        h2: ["20px", { lineHeight: "28px", fontWeight: "700" }],
        h3: ["18px", { lineHeight: "26px", fontWeight: "700" }],
        h4: ["16px", { lineHeight: "24px", fontWeight: "600" }],
        h5: ["15px", { lineHeight: "22px", fontWeight: "600" }],
        h6: ["14px", { lineHeight: "20px", fontWeight: "600" }],

        body: ["14px", { lineHeight: "20px", fontWeight: "400" }],
        caption: ["12px", { lineHeight: "16px", fontWeight: "400" }],
        btn: ["15px", { lineHeight: "20px", fontWeight: "600", letterSpacing: "0.01em" }],
        stat: ["18px", { lineHeight: "26px", fontWeight: "700" }],
      },
    },
  },
  plugins: [],
};
