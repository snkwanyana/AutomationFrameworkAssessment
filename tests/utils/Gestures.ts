type Direction = 'up' | 'down' | 'left' | 'right';

class Gestures {
    // Swipes inside an element; direction is the finger's movement, so 'up' scrolls content down.
    async swipe(element: ChainablePromiseElement, direction: Direction, percent = 0.75) {
        await driver.execute('mobile: swipeGesture', {
            elementId: await element.elementId,
            direction,
            percent,
        });
    }

    // Swipes within the whole screen.
    async swipeScreen(direction: Direction, percent = 0.75) {
        const { width, height } = await driver.getWindowSize();
        await driver.execute('mobile: swipeGesture', {
            left: Math.round(width * 0.1),
            top: Math.round(height * 0.2),
            width: Math.round(width * 0.8),
            height: Math.round(height * 0.6),
            direction,
            percent,
        });
    }

    async scrollVertical(direction: 'up' | 'down' = 'down', percent = 0.75) {
        await this.swipeScreen(direction === 'down' ? 'up' : 'down', percent);
    }

    async scrollHorizontal(direction: 'left' | 'right' = 'right', percent = 0.75) {
        await this.swipeScreen(direction === 'right' ? 'left' : 'right', percent);
    }

    async scrollVerticalUntilVisible(target: ChainablePromiseElement, direction: 'up' | 'down' = 'down', maxScrolls = 10) {
        for (let i = 0; i < maxScrolls; i++) {
            if (await target.isDisplayed()) return;
            await this.scrollVertical(direction);
        }
        throw new Error(`Element not visible after ${maxScrolls} vertical scrolls`);
    }

    async scrollHorizontalUntilVisible(target: ChainablePromiseElement, direction: 'left' | 'right' = 'right', maxScrolls = 10) {
        for (let i = 0; i < maxScrolls; i++) {
            if (await target.isDisplayed()) return;
            await this.scrollHorizontal(direction);
        }
        throw new Error(`Element not visible after ${maxScrolls} horizontal scrolls`);
    }

    // Swipes up in the upper part of the screen (clear of horizontal carousels, which capture the gesture)
    // until the page source stops changing, i.e. the bottom has been reached.
    async scrollToBottom(maxScrolls = 15) {
        const { width, height } = await driver.getWindowSize();
        let previous = '';
        for (let i = 0; i < maxScrolls; i++) {
            await driver.execute('mobile: swipeGesture', {
                left: 0,
                top: Math.round(height * 0.08),
                width,
                height: Math.round(height * 0.4),
                direction: 'up',
                percent: 0.9,
            });
            const current = await driver.getPageSource();
            if (current === previous) return;
            previous = current;
        }
    }}

export default new Gestures();




