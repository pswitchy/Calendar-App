
module.exports = {
  plugins: {
    'tailwindcss': {},
    'autoprefixer': {},
    'postcss-preset-env': {
      features: {
        'nesting-rules': true,
        'custom-properties': false, // We're using CSS variables through Tailwind
      },
      autoprefixer: {
        flexbox: 'no-2009',
        grid: 'autoplace',
      },
      stage: 3,
      browsers: ['> 1%', 'last 2 versions', 'Firefox ESR', 'not dead'],
    },
    ...(process.env.NODE_ENV === 'production' ? {
      'cssnano': {
        preset: ['default', {
          discardComments: {
            removeAll: true,
          },
          normalizeWhitespace: false,
          colormin: false, // Preserve Tailwind color variables
        }],
      }
    } : {}),
  },
}