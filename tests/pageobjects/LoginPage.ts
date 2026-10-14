class LoginPage {
    get usernameInput() {
        return $('~input-email');
    }

    get passwordInput() {
        return $('~input-password');
    }

    get loginButton() {
        return driver.isIOS
            ? $('~button-LOGIN')
            : $('//android.widget.TextView[@text="LOGIN"]');
    }

    get loginSuccessMessage() {
        return driver.isIOS
            ? $('-ios predicate string:type == "XCUIElementTypeStaticText" AND label CONTAINS "You are logged in"')
            : $('id=android:id/message');
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
        return driver.isIOS
            ? $('-ios predicate string:type == "XCUIElementTypeButton" AND label == "OK"')
            : $('id=android:id/button1');
    }

    get loginErrorMessage() {
        const text = 'Please enter at least 8 characters';
        return driver.isIOS
            ? $(`-ios predicate string:type == "XCUIElementTypeStaticText" AND label == "${text}"`)
            : $(`//android.widget.TextView[@text="${text}"]`);
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