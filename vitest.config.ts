import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
/// <reference types="@vitest/browser/providers/playwright" />

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './vitest.setup.ts',
    include: ['**/*.test.{ts,tsx}'],
    browser: {
      provider: 'playwright',
      enabled: true,
      instances: [
        { browser: 'chromium' },
      ],
    },
  },
});
