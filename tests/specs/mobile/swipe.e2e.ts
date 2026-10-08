import { expect } from '@wdio/globals';
import SwipePage from '../../pageobjects/SwipePage';

describe('Swipe', () => {
    beforeEach(async () => {
        await SwipePage.openSwipeTap();
    });

    it('should scroll the carousel horizontally', async () => {
        await expect(SwipePage.carousel).toBeDisplayed();
        await expect(SwipePage.firstCardTitle).toBeDisplayed();

        await SwipePage.scrollHorizontally('right');
        await expect(SwipePage.communityCardTitle).toBeDisplayed();

        await SwipePage.scrollHorizontally('left');
        await expect(SwipePage.firstCardTitle).toBeDisplayed();
    });

    it('should scroll to the bottom and show the logo', async () => {
        await SwipePage.scrollToBottom();
        await expect(SwipePage.logo).toBeDisplayed();
    });
});


