/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "gray-custom": "#a6a6a6",
        sidebar: "#1b1c1e",
      },
      borderWidth: {
        1.5: "1.5px",
      },
    },
  },
  plugins: [require("tailwind-scrollbar")],
};
