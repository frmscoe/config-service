const tailwindColors = require("tailwindcss/colors");

module.exports = {
  content: ["./pages/**/*.{js,ts,jsx,tsx,scss}", "./src/**/*.{js,ts,jsx,tsx,scss}"],
  theme: {
    fontFamily: {
      sans: ['"Roboto"', "sans-serif"],
    },
    extend: {
      colors: {
        gray: {
          DEFAULT: "#686868",
          dark: "#303030",
          light: "#979899",
          ...tailwindColors.gray,
        },
        blue: {
          DEFAULT: "#2737C6",
          ...tailwindColors.blue,
        },
        red: {
          DEFAULT: "#C90185",
          light: "#FF896B",
        },
      },
    },
  },
  plugins: [],
};
