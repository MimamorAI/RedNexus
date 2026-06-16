module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class', // enable dark mode
  theme: {
    extend: {
      colors: {
        primary: '#00ff7f',
        danger: '#ff4d4d',
        warning: '#ffb84d',
        info: '#33d9ff',
      },
    },
  },
  plugins: [],
};
