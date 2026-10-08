const PIECES = ['l1', 'c1', 'r1', 'c2', 'r2', 'l3', 'c3', 'r3', 'l2'] as const;
type Piece = typeof PIECES[number];

class DragPage {
    get dragTab() {
        return $('~Drag');
    }

    get dragScreen() {
        return $('~Drag-drop-screen');
    }

    get renewButton() {
        return $('~renew');
    }

    get congratulationsMessage() {
        return $('android=new UiSelector().textContains("Congratulations")');
    }

    // The l2 piece is pre-placed, so it has no drag/drop locators.
    dragPiece(piece: Piece) {
        return $(`~drag-${piece}`);
    }

    dropZone(piece: Piece) {
        return $(`~drop-${piece}`);
    }

    async openDragTab() {
        await this.dragTab.click();
        await this.dragScreen.waitForDisplayed();
    }

    async dragAndDrop(piece: Piece) {
        const source = this.dragPiece(piece);
        const { x, y } = await this.dropZone(piece).getLocation();
        const { width, height } = await this.dropZone(piece).getSize();

        await driver.execute('mobile: dragGesture', {
            elementId: await source.elementId,
            endX: Math.round(x + width / 2),
            endY: Math.round(y + height / 2),
            speed: 1500,
        });
    }

    async completePuzzle() {
        for (const piece of PIECES) {
            await this.dragAndDrop(piece);
        }
    }

    async resetPuzzle() {
        await this.renewButton.click();
    }
}

export default new DragPage();

