import { expect } from '@wdio/globals';
import SignupPage from '../../pageobjects/SignupPage';
import { createUserCredentials } from '../../utils/TestData';

describe('Signup', () => {
    beforeEach(async () => {
        await SignupPage.open();
    });

    it('should sign up with valid credentials', async () => {
        // const email = `user${Date.now()}@example.com`;
        const { email, password } = createUserCredentials();

        await SignupPage.signup(email, password, password);

        await SignupPage.signupSuccessMessage.waitForDisplayed();
        await expect(SignupPage.signupSuccessMessage).toHaveText(
            expect.stringContaining('successfully signed up'),
        );
        await SignupPage.confirmSignup();
    });
});
