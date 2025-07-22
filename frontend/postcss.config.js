// postcss.config.js

const config = {
  plugins: {
    // This is the correct way to include Tailwind CSS v4 as a PostCSS plugin
    tailwindcss: {},
    // Keep autoprefixer if you want to use it
    autoprefixer: {},
  },
};

export default config;
