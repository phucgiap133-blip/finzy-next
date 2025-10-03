/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { primary: "var(--semantic-color-brand-primary)" },
        bg: { page: "var(--semantic-color-bg-page)", card: "var(--semantic-color-bg-card)" },
        text: { DEFAULT: "var(--semantic-color-text-default)", muted: "var(--semantic-color-text-muted)" },
        border: { DEFAULT: "var(--semantic-color-border-default)" },
      },
      borderRadius: {
        control: "8px",
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
      },
      fontSize: {
        h1: ["2rem", { lineHeight: "2.5rem", fontWeight: "700" }],
        h2: ["1.5rem", { lineHeight: "2rem", fontWeight: "600" }],
        h3: ["1.25rem", { lineHeight: "1.75rem", fontWeight: "600" }],
        h4: ["1.125rem", { lineHeight: "1.5rem", fontWeight: "600" }],
        h5: ["1rem", { lineHeight: "1.5rem", fontWeight: "600" }],
        h6: ["0.875rem", { lineHeight: "1.25rem", fontWeight: "600" }],
        body: ["0.9375rem", { lineHeight: "1.5rem" }],
        caption: ["0.75rem", { lineHeight: "1.25rem" }],
        btn: ["0.875rem", { lineHeight: "1.25rem", fontWeight: "600" }],
        stat: ["1.25rem", { lineHeight: "1.75rem", fontWeight: "700" }],
      },
    },
  },
  plugins: [],
};
