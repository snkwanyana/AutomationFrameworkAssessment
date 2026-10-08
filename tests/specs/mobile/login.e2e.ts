import { expect } from '@wdio/globals';
import LoginPage from '../../pageobjects/LoginPage';
import { createUserCredentials, invalidUserCredentials } from '../../utils/TestData';

describe('Login', () => {
    beforeEach(async () => {
        await LoginPage.open();
    });


    it('should log in with valid credentials', async () => {
        const { email: username, password } = createUserCredentials();

        await LoginPage.login(username, password);

        await LoginPage.loginSuccessMessage.waitForDisplayed();
        await expect(LoginPage.loginSuccessMessage).toHaveText(
            expect.stringContaining('You are logged in!'),
        );
        await LoginPage.confirmLogin();
    });

    it('should not log in with invalid credentials', async () => {
        const { email: username, password } = invalidUserCredentials();

        await LoginPage.login(username, password);

        await LoginPage.loginErrorMessage.waitForDisplayed();
        await expect(LoginPage.loginErrorMessage).toHaveText(
            expect.stringContaining('Please enter at least 8 characters'),
        );
        await LoginPage.confirmLoginError();
    });
});