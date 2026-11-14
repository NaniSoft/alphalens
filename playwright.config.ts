import { defineConfig, devices } from '@playwright/test';

/**
 * Visual + runtime enforcement (mission §12). Four viewports × two modes.
 * Baselines live in `e2e/visual-baselines` and intentional changes require review.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: process.env.DS_BASE_URL ?? 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    viewport: { width: 1440, height: 900 },
  },
  snapshotDir: './e2e/visual-baselines',
  projects: [
    {
      name: 'mobile-light',
      use: { ...devices['iPhone 14'], viewport: { width: 390, height: 844 } },
    },
    {
      name: 'tablet-light',
      use: { ...devices['iPad mini'], viewport: { width: 768, height: 1024 } },
    },
    {
      name: 'desktop-light',
      use: { viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'wide-light',
      use: { viewport: { width: 1920, height: 1080 } },
    },
    {
      name: 'mobile-dark',
      use: { ...devices['iPhone 14'], viewport: { width: 390, height: 844 }, colorScheme: 'dark' },
    },
    {
      name: 'tablet-dark',
      use: { ...devices['iPad mini'], viewport: { width: 768, height: 1024 }, colorScheme: 'dark' },
    },
    {
      name: 'desktop-dark',
      use: { viewport: { width: 1440, height: 900 }, colorScheme: 'dark' },
    },
    {
      name: 'wide-dark',
      use: { viewport: { width: 1920, height: 1080 }, colorScheme: 'dark' },
    },
  ],
  webServer: process.env.DS_SKIP_WEBSERVER
    ? undefined
    : {
        command: 'pnpm exec serve out -l 4173',
        url: 'http://127.0.0.1:4173',
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
      },
});
