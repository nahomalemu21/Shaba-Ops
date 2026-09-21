const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://shabacloset.com',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: false,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 12000,
    pageLoadTimeout: 90000,
    retries: { runMode: 1, openMode: 0 },
  },
});
