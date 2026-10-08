export interface UserCredentials {
    email: string;
    password: string;
}

export function createUserCredentials(): UserCredentials {
    return {
        email: `automation.${Date.now()}@example.com`,
        password: 'Password123!',
    };
}

export function invalidUserCredentials(): UserCredentials {
    return {
        email: `automation@example.com`,
        password: 'Invalid',
    };
}