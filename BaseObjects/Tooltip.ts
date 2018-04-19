import {O} from "./O";
/**
 * Created by MSI on 04.07.2017.
 */
import {Vec2} from "../Math";
import {Application, TweenMax} from "../Application";

export const TOOLTIP_WIDTH = 260, TOOLTIP_HEIGHT = 260;
const SPACE_SIZE = 8;
const LINE_BREAK = 18;

export type ColorFunc = (obj: any, word: string, tags: string[]) => {color: number; word: string}

export class Tooltip {
    public pos: Vec2;
    currentObject: any; //any kind of object we made tooltip for

    get currentTip(): PIXI.Container {
        return this._currentTip;
    }

    set currentTip(value: PIXI.Container) {
        if (this._currentTip) O.rp(this._currentTip);

        if (value) {
            Application.One.sm.fonts.addChild(value);
        } else {
            this.currentObject = null;
        }
        this._currentTip = value;
    }

    protected _currentTip: PIXI.Container;

    constructor(p: Vec2) {
        if (!p) {
            this.pos = [0, 0];
        } else {
            this.pos = p;
        }
    }



    addSpaces(texts: Array<any>, y: number, boundWidth: number) {
        let line = [];
        let total = 0;
        let spaces = 0;
        for (let x of texts) {
            if (x.y == y) {
                let bounds = x.getLocalBounds(x.worldTransform);
                total += bounds.width;
                line.push(x)
            }
        }
        for (let x = 0; x < line.length - 1; ++x) {
            spaces += SPACE_SIZE;
        }
        let addSpaces = line.length - 1;
        let freeSpace = boundWidth - (total + spaces);
        let addSpace = freeSpace / addSpaces;
        if (addSpace < 0) return;
        let xx = 0;
        for (let x = 0; x < line.length; ++x) {
            let tf = line[x];
            let bounds = tf.getLocalBounds(tf.worldTransform);
            tf.x = xx;
            xx += bounds.width + SPACE_SIZE + addSpace;

        }
    }



    createTF(t: string, fontName: string): any {
        return new PIXI.extras.BitmapText(t, PIXI.extras.BitmapText.fonts[fontName])
    }



    //test tooltip
    // Adds r[25% damage ] with bla bla bla
    makeTooltip(text: string, boundWidth: number, boundHeight: number, obj: any, wordToColorFunc: ColorFunc, fontName: string = 'smallfontx1', fontScale: number = 1, center: boolean = false): PIXI.Container {
    let desc = new PIXI.Container();
        let lines = text.split("\n");
        let leftBorder = 22;
        let x = 0;
        let y = -25;
        let lb: number;
        let tags = [];
        for (let l = 0; l < lines.length; ++l) {
            let words = lines[l].split(/[\s]+/);
            for (let i = 0; i < words.length; ++i) {
                let w = words[i];
                if (w.length > 0 && w[2] == '{') {
                    tags.push(w.slice(0, 2));
                    w = w.slice(3);
                }


                if (w[0] == '}') {
                    tags.pop();
                    w = w.slice(1);
                }

                if (w[w.length - 1] == '}') {
                    w = w.slice(0, w.length - 1);
                }

                let o = wordToColorFunc(obj, w, tags);

                if (words[i][words[i].length - 1] == '}') {
                    tags.pop();
                }

                let pt = this.createTF(o.word, fontName);
                pt.font.size *= fontScale;
                lb = pt.font.size / 2;
                pt.tint = o.color;
                pt.x = x;
                pt.y = y - pt.font.size;
                desc.addChild(pt);
                let bounds = pt.getLocalBounds(pt.worldTransform);

                if (pt.x + bounds.width > boundWidth) {
                    //linebreak
                    x = 0;
                    let prevY = y - pt.font.size;
                    y += lb;
                    pt.x = 0;
                    pt.y = y - pt.font.size;
                    this.addSpaces(desc.children, prevY, boundWidth);
                }

                x += bounds.width + SPACE_SIZE;
            }
            y += lb;
            x = 0;
        }

        for (let x of desc.children) {
            x.x += leftBorder
        }

        desc.x = this.pos[0];
        desc.y = this.pos[1];

        return desc
    }
}