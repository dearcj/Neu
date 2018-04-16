import ColorTransform = PIXI.heaven.ColorTransform;

export class HeavenBitmapText extends PIXI.extras.BitmapText {

    color: ColorTransform = new PIXI.heaven.ColorTransform();

    updateText() {
        for (let x of this._glyphs) {
            let anyx: any = x;
            if (!anyx.color) {
                anyx.convertToHeaven();
                anyx.color = this.color;
            }
        }
        super.updateText();

        for (let x of this._glyphs) {
            let anyx: any = x;
            if (!anyx.color) {
                anyx.convertToHeaven();
                anyx.color = this.color;
            }
        }
    }
}