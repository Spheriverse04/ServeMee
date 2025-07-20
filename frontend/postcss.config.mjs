// postcss.config.mjs

const config = {
  plugins: {
    // This is the correct way to include Tailwind CSS v4 as a PostCSS plugin
    '@tailwindcss/postcss': {},
    // Keep autoprefixer if you want to use it
    autoprefixer: {},
  },
};

export default config;
