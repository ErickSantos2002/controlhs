/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Aqui você pode customizar cores, fontes, etc.
      colors: {
        // Exemplo de cor customizada
        primary: {
          DEFAULT: "#2563eb", // Azul padrão do Tailwind (você pode trocar depois)
        },
      },
    },
  },
  plugins: [],
};
