import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
      NEXTAUTH_URL: 'http://localhost:3000',
      NEXTAUTH_SECRET: 'test-secret-at-least-32-characters-long',
      GOOGLE_CLIENT_ID: 'test-google-client-id',
      GOOGLE_CLIENT_SECRET: 'test-google-client-secret',
      RESEND_API_KEY: 'test-resend-api-key',
      EMAIL_FROM: 'test@example.com',
    },
    coverage: {
      provider: 'v8',
      include: ['src/lib/**', 'src/actions/**'],
      exclude: ['src/generated/**'],
    },
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
