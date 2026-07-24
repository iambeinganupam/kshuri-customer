module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/vendors',
        // /vendors/[slug] needs a concrete slug; skip in R1 CI and revisit when seed data lands
      ],
      numberOfRuns: 1,
      settings: {
        preset: 'desktop',                              // CI desktop preset for stability; mobile preset can land as a follow-up
        chromeFlags: '--no-sandbox',
      },
      startServerCommand: 'npm run build && npm run start',
      startServerReadyPattern: 'Ready in',
      startServerReadyTimeout: 120000,
    },
    assert: {
      assertions: {
        'categories:performance':    ['warn',  { minScore: 0.80 }],   // R1 starts at 80; tighten to 85 once optimized
        'categories:accessibility':  ['error', { minScore: 0.95 }],
        'categories:seo':            ['error', { minScore: 0.95 }],
        'categories:best-practices': ['warn',  { minScore: 0.90 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
