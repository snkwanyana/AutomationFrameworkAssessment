import FormsPage from '../../pageobjects/FormsPage';

describe('Forms Page', () => {
    it('should enter text in the input field', async () => {
        await FormsPage.openForms();
        await FormsPage.enterInputField('Test');
        const inputValue = await FormsPage.verifyInputField();
        expect(inputValue).toBe('Test');
    });

    it('should toggle the switch button', async () => {
        await FormsPage.clickSwitchButton();
        const switchMessage = await FormsPage.getSwitchMessage();
        expect(switchMessage).toBe('Click to turn the switch OFF');
    });

    it('should select an option from the dropdown', async () => {
        await FormsPage.clickDropdown();
        await FormsPage.selectDropdownOption();
    });

    it('should click the active button', async () => {
        await FormsPage.clickActiveButton();
    });

    it('should confirm the message and click OK', async () => {
        const message = await FormsPage.confirmMessage();
        expect(message).toBe('This button is active');
        await FormsPage.clickOkButton();
    });
});