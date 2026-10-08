import Gestures from '../utils/Gestures';

class SwipePage {
    get swipeTap() {
        return $('~Swipe');
    }

    get swipeScreen() {
        return $('~Swipe-screen');
    }

    get swipeHorizontalTitle() {
        return $('android=new UiSelector().text("Swipe horizontal")');
    }

    get swipeVerticalTitle() {
        return $('android=new UiSelector().textContains("Or swipe vertical")');
    }

    // resource-id has no package prefix, so id= would not match; use UiSelector.
    get carousel() {
        return $('android=new UiSelector().resourceId("Carousel")');
    }

    carouselItem(index: number) {
        return $(`android=new UiSelector().resourceId("__CAROUSEL_ITEM_${index}__")`);
    }

    get firstCardTitle() {
        return $('android=new UiSelector().text("FULLY OPEN SOURCE")');
    }

    get communityCardTitle() {
        return $('android=new UiSelector().text("GREAT COMMUNITY")');
    }

    // Only present after scrolling to the bottom of the screen.
    get logo() {
        return $('~WebdriverIO logo');
    }

    async openSwipeTap() {
        await this.swipeTap.click();
        await this.swipeScreen.waitForDisplayed();
    }

    async scrollHorizontally(direction: 'left' | 'right' = 'right') {
        await Gestures.swipe(this.carousel, direction === 'right' ? 'left' : 'right');
    }

    async scrollToBottom() {
        await Gestures.scrollToBottom();
    }

    async scrollVerticallyToLogo() {
        await Gestures.scrollVerticalUntilVisible(this.logo, 'down');
    }
}

export default new SwipePage();


