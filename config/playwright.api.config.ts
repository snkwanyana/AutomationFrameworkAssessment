import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: '../tests/specs/api',
    testMatch: '**/*.spec.ts',
    timeout: 30_000,
    retries: 1,
    reporter: [['list'], ['html', { outputFolder: '../reports/api', open: 'never' }]],
    use: {
        baseURL: process.env.BOOKER_BASE_URL ?? 'https://restful-booker.herokuapp.com',
        extraHTTPHeaders: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
    },
});
