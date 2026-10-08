import { test, expect } from '@playwright/test';
import { validCredentials } from '../../utils/ApiTestData';

test.describe('Auth API', () => {
    test('POST /auth returns a token for valid credentials', async ({ request }) => {
        const response = await request.post('/auth', { 
            data: validCredentials() 
        });

        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.token).toEqual(expect.any(String));
        expect(body.token).not.toHaveLength(0);
    });
});
