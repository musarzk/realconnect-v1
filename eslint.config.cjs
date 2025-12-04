module.exports = [
  ...require("eslint-config-next"),
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: {
      "@next/next/no-img-element": "off",
    },
    ignores: ["node_modules/**", ".next/**"],
  },
];
