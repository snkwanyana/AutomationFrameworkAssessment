export interface BookingPayload {
    firstname: string;
    lastname: string;
    totalprice: number;
    depositpaid: boolean;
    bookingdates: {
        checkin: string;
        checkout: string;
    };
    additionalneeds: string;
}

export function validCredentials() {
    return {
        username: process.env.BOOKER_USERNAME ?? 'admin',
        password: process.env.BOOKER_PASSWORD ?? 'password123',
    };
}

export function createBookingPayload(): BookingPayload {
    return {
        firstname: 'Automation',
        lastname: `Tester${Date.now()}`,
        totalprice: 250,
        depositpaid: true,
        bookingdates: {
            checkin: '2026-11-01',
            checkout: '2026-11-05',
        },
        additionalneeds: 'Breakfast',
    };
}
