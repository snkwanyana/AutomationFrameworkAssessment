class FormsPage {

    get inputField() {
        return $('~text-input');
    }

    get inputFieldData() {
        return $('~input-text-result');
    }

    get switchButton() {
        return $('~switch');
    }

    get switchMessage() {
        return $('~switch-text');
    }

    get dropdown() {
        return $('//android.widget.EditText[@resource-id="text_input"]');
    }

    get dropdownOption() {
        
        return $(`//android.widget.CheckedTextView[@resource-id="android:id/text1" and @text="Appium is awesome"]`);
    
    }

    get activeButton() {
        return $('~button-Active');
    }

    get confirmationMessage() {
        return $('id=android:id/message');
    }

    get okButton() {
        return $('id=android:id/button1');
    }


    async openForms() {
        await this.formsTab.click();
    
    }

    get formsTab() {
        return $('~Forms');
    }

    async enterInputField(text: string) {
        await this.inputField.setValue(text);
    }

    async verifyInputField() {
        return await this.inputFieldData.getText();
    }

    async clickSwitchButton() {
        await this.switchButton.click();
    }

    async getSwitchMessage() {
        return await this.switchMessage.getText();
    }

    async clickDropdown() {
        await this.dropdown.click();
    }   

    async selectDropdownOption() {
        await this.dropdownOption.click();
    }

    async clickActiveButton() {
        await this.activeButton.click();
    }

    async confirmMessage() {
        await this.confirmationMessage.waitForDisplayed();
        return await this.confirmationMessage.getText();
    }

    async clickOkButton() {
        await this.okButton.click();
    }
}

export default new FormsPage();
