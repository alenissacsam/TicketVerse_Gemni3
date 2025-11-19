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
      },
    },
    plugins: [],
  },
  {
    colors: {
      "btn-primary": createColorSet("#363FF9", "#363FF9"),
      "fg-accent-brand": createColorSet("#363FF9", "#363FF9"),
    },
  },
);
