import {Application} from "../Application";
import ColorTransform = PIXI.heaven.ColorTransform;
import BitmapTextStyle = PIXI.extras.BitmapTextStyle;

export class PoolHeavenBitmapText extends PIXI.extras.BitmapText {
    get color(): PIXI.heaven.ColorTransform {
        return this._color;
    }

    set color(value: PIXI.heaven.ColorTransform) {
        this._color = value;
    }
    private _color: ColorTransform;

    constructor(text, style?: BitmapTextStyle) {
        super(text, style);
    }

    updateText () {
        if (!this._color) this._color = new PIXI.heaven.ColorTransform();

        var data = PIXI.extras.BitmapText.fonts[(<any>this._font).name];
        var scale = (<any>this._font).size / data.size;
        var pos = new PIXI.Point();
        var chars = [];
        var lineWidths = [];
        var text = this.text.replace(/(?:\r\n|\r)/g, '\n');
        var textLength = text.length;
        var maxWidth = this._maxWidth * data.size / (<any>this._font).size;

        var prevCharCode = null;
        var lastLineWidth = 0;
        var maxLineWidth = 0;
        var line = 0;
        var lastBreakPos = -1;
        var lastBreakWidth = 0;
        var spacesRemoved = 0;
        var maxLineHeight = 0;

        for (var i = 0; i < textLength; i++) {
            var charCode = text.charCodeAt(i);
            var char = text.charAt(i);

            if (/(?:\s)/.test(char)) {
                lastBreakPos = i;
                lastBreakWidth = lastLineWidth;
            }

            if (char === '\r' || char === '\n') {
                lineWidths.push(lastLineWidth);
                maxLineWidth = Math.max(maxLineWidth, lastLineWidth);
                ++line;
                ++spacesRemoved;

                pos.x = 0;
                pos.y += data.lineHeight;
                prevCharCode = null;
                continue;
            }

            var charData = data.chars[charCode];

            if (!charData) {
                continue;
            }

            if (prevCharCode && charData.kerning[prevCharCode]) {
                pos.x += charData.kerning[prevCharCode];
            }

            chars.push({
                texture: charData.texture,
                line: line,
                charCode: charCode,
                position: new PIXI.Point(pos.x + charData.xOffset + (<any>this)._letterSpacing / 2, pos.y + charData.yOffset)
            });
            pos.x += charData.xAdvance + (<any>this)._letterSpacing;
            lastLineWidth = pos.x;
            maxLineHeight = Math.max(maxLineHeight, charData.yOffset + charData.texture.height);
            prevCharCode = charCode;

            if (lastBreakPos !== -1 && maxWidth > 0 && pos.x > maxWidth) {
                ++spacesRemoved;
                PIXI.utils.removeItems(chars, 1 + lastBreakPos - spacesRemoved, 1 + i - lastBreakPos);
                i = lastBreakPos;
                lastBreakPos = -1;

                lineWidths.push(lastBreakWidth);
                maxLineWidth = Math.max(maxLineWidth, lastBreakWidth);
                line++;

                pos.x = 0;
                pos.y += data.lineHeight;
                prevCharCode = null;
            }
        }

        var lastChar = text.charAt(text.length - 1);

        if (lastChar !== '\r' && lastChar !== '\n') {
            if (/(?:\s)/.test(lastChar)) {
                lastLineWidth = lastBreakWidth;
            }

            lineWidths.push(lastLineWidth);
            maxLineWidth = Math.max(maxLineWidth, lastLineWidth);
        }

        var lineAlignOffsets = [];

        for (var _i = 0; _i <= line; _i++) {
            var alignOffset = 0;

            if ((<any>this._font).align === 'right') {
                alignOffset = maxLineWidth - lineWidths[_i];
            } else if ((<any>this._font).align === 'center') {
                alignOffset = (maxLineWidth - lineWidths[_i]) / 2;
            }

            lineAlignOffsets.push(alignOffset);
        }

        var lenChars = chars.length;
        var tint = this.tint;

        for (var _i2 = 0; _i2 < lenChars; _i2++) {
            var c = this._glyphs[_i2]; // get the next glyph sprite

            if (c) {
                c.texture = chars[_i2].texture;
            } else {
                c = Application.One.cs(null, null, chars[_i2].texture, false);
                this._glyphs.push(c);
            }
            (<PIXI.heaven.Sprite>c).color = this._color;

            c.position.x = (chars[_i2].position.x + lineAlignOffsets[chars[_i2].line]) * scale;
            c.position.y = chars[_i2].position.y * scale;
            c.scale.x = c.scale.y = scale;
            c.tint = tint;

            if (!c.parent) {
                this.addChild(c);
            }
        }

        // remove unnecessary children.
        for (var _i3 = lenChars; _i3 < this._glyphs.length; ++_i3) {
            this.removeChild(this._glyphs[_i3]);
        }

        this._textWidth = maxLineWidth * scale;
        this._textHeight = (pos.y + data.lineHeight) * scale;

        // apply anchor
        if ((<any>this.anchor).x !== 0 || (<any>this.anchor).y !== 0) {
            for (var _i4 = 0; _i4 < lenChars; _i4++) {
                this._glyphs[_i4].x -= this._textWidth * (<any>this.anchor).x;
                this._glyphs[_i4].y -= this._textHeight * (<any>this.anchor).y;
            }
        }
        this._maxLineHeight = maxLineHeight * scale;
    };
}