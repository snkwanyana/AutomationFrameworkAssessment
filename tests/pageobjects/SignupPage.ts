class SignupPage {
    get loginTab() {
        return $('~Login');
    }

    get signupFormToggle() {
        return $('~button-sign-up-container');
    }

    get usernameInput() {
        return $('~input-email');
    }

    get passwordInput() {
        return $('~input-password');
    }

    get confirmPasswordInput() {
        return $('~input-repeat-password');
    }

    get signupButton() {
        return $('~button-SIGN UP');
    }

    get signupSuccessMessage() {
        return $('id=android:id/message');
    }

    get signupOkButton() {
        return $('id=android:id/button1');
    }

    async open() {
        await this.loginTab.click();
        await this.signupFormToggle.click();
    }

    async signup(username: string, password: string, confirmPassword: string) {
        await this.usernameInput.setValue(username);
        await this.passwordInput.setValue(password);
        await this.confirmPasswordInput.setValue(confirmPassword);
        await this.signupButton.click();
    }

    async confirmSignup() {
        await this.signupSuccessMessage.waitForDisplayed();
        await this.signupOkButton.click();
    }
}

export default new SignupPage();
