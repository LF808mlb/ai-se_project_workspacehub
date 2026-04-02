/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#14213d",
        panel: "#f7f8fb",
        brand: "#0f766e",
        accent: "#f59e0b",
        danger: "#dc2626"
      }
    }
  },
  plugins: []
};
