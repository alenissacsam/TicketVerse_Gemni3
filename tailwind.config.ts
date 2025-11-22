import { withAccountKitUi, createColorSet } from "@account-kit/react/tailwind";

export default withAccountKitUi(
  {
    content: [
      "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
      "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
      "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
      extend: {
        colors: {
          background: "var(--background)",
          foreground: "var(--foreground)",
        },
        fontFamily: {
          handwriting: ["var(--font-handwriting)"],
          serif: ["var(--font-serif)"],
          display: ["var(--font-display)"],
        },
      },
    },
    plugins: [],
  },
  {
    colors: {
      "btn-primary": createColorSet("#1a1a1a", "#e5e5e5"),
      "fg-accent-brand": createColorSet("#1a1a1a", "#e5e5e5"),
    },
  },
);
