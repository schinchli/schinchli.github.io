module.exports = {
  testDir: 'tests',
  use: { baseURL: process.env.BASE_URL || 'http://127.0.0.1:4173', channel: 'chrome' },
  webServer: process.env.BASE_URL ? undefined : { command: 'python3 -m http.server 4173 -b 127.0.0.1', url: 'http://127.0.0.1:4173', reuseExistingServer: true },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1280, height: 800 } } },
    { name: 'phone', use: { viewport: { width: 390, height: 844 } } },
  ],
};
