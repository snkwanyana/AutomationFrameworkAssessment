class LoginPage {
    get usernameInput() {
        return $('~input-email');
    }

    get passwordInput() {
        return $('~input-password');
    }

    get loginButton() {
        return $('//android.widget.TextView[@text="LOGIN"]');
    }

    get loginSuccessMessage() {
        return $('id=android:id/message');
    }

    async open() {
        await this.loginTab.click();
        await this.loginFormToggle.click();
    }

    get loginTab() {
        return $('~Login');
    }

    get loginFormToggle() {
        return $('~button-login-container');
    }

    get loginOkButton() {
        return $('id=android:id/button1');
    }

    get loginErrorMessage() {
        return $('//android.widget.TextView[@text="Please enter at least 8 characters"]');
    }

    async login(username: string, password: string) {
        await this.usernameInput.setValue(username);
        await this.passwordInput.setValue(password);
        await this.loginButton.click();
    }

    async confirmLogin() {
        await this.loginSuccessMessage.waitForDisplayed();
        await this.loginOkButton.click();
    }

    async confirmLoginError() {
        await this.loginErrorMessage.waitForDisplayed();
        // await this.loginOkButton.click();
    }

    
}

export default new LoginPage();