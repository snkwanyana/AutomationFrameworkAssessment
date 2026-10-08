import { test, expect } from '@playwright/test';
import { createBookingPayload } from '../../utils/ApiTestData';

test.describe('Booking API', () => {
    test('POST /booking creates a booking matching the request', async ({ request }) => {
        const payload = createBookingPayload();

        const response = await request.post('/booking', { 
                data: payload 
            });

        expect(response.status()).toBe(200);
        expect(response.headers()['content-type']).toContain('application/json');

        const body = await response.json();
        expect(body.bookingid).toEqual(expect.any(Number));
        expect(body.bookingid).toBeGreaterThan(0);
        expect(body.booking).toEqual(payload);
    });
});
