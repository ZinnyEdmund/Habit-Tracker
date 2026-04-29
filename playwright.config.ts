import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

const workspaceRoot = process.cwd();

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: 'http://127.0.0.1:3001',
    trace: 'on-first-retry',
    serviceWorkers: 'allow',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    // Ensure the app is built before starting the production server so Playwright
    // doesn't attempt to start `next start` against an empty .next folder.
    // This runs the project's build script and then starts Next in production.
    command: 'npm run build && node ./node_modules/next/dist/bin/next start -p 3001',
    url: 'http://127.0.0.1:3001',
    reuseExistingServer: true,
    cwd: workspaceRoot,
    env: {
      ...process.env,
      USERPROFILE: workspaceRoot,
      HOME: workspaceRoot,
      APPDATA: path.join(workspaceRoot, '.appdata'),
      LOCALAPPDATA: path.join(workspaceRoot, '.localappdata'),
      npm_config_cache: path.join(workspaceRoot, '.npm-cache'),
    },
  },
});
