module.exports = {
  content: [],
  theme: {
    extend: {
      colors: {
        black: {
          DEFAULT: '#000000',
          800: '#ABABAB',
        },
      },
      screens: {
        xs: '480px',
        sm: '600px',
        md: '960px',
      },
    },
  },
  plugins: [],
  purge: {
    // Filenames to scan for classes
    content: [
      './src/**/*.html',
      './src/**/*.js',
      './src/**/*.jsx',
      './src/**/*.ts',
      './src/**/*.tsx',
      './public/index.html',
    ],
    // Options passed to PurgeCSS
    options: {
      // Whitelist specific selectors by name
      // safelist: [],
    },
  },
};
