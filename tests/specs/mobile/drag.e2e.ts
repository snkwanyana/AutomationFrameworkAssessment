import { expect } from '@wdio/globals';
import DragPage from '../../pageobjects/DragPage';

describe('Drag and drop', () => {
    beforeEach(async () => {
        await DragPage.openDragTab();
    });

    it('should complete the image puzzle', async () => {
        await DragPage.completePuzzle();

        await expect(DragPage.congratulationsMessage).toBeDisplayed();
    });
});

