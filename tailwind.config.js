/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      height: {
        '128': '32rem',
        '5vh': '5vh',
        '10vh': '10vh',
        '20vh': '20vh',
        '30vh': '30vh',
        '35vh': '35vh',
        '40vh': '40vh',
        '45vh': '45vh',
        '50vh': '50vh',
        '60vh': '60vh',
        '65vh': '65vh',
        '80vh': '80vh',
        '90vh': '90vh',        
      },
      width: {
        '30vw': '30vw',
      },
    fontSize: {
      xxs: "0.50rem",
    },      
    },
  },
  plugins: [],
}

