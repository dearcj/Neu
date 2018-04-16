/**
 * Created by MSI on 05.01.2017.
 */
import {Camera} from "./Camera";
import {IO} from "./IO";
import {TextBox} from "./TextBox";
import {ColorFunc, Tooltip} from "./Tooltip";
import {O} from "./O";
import {Application} from "../Application";

/**
 * Created by KURWINDALLAS on 11.07.2014.
 *////

const DEFAULT_FONT = 'smallfontp';

export class ColorTextBox extends TextBox {
    tf: PIXI.Container;

    private tooltip: Tooltip;
    public maxWidth: number = 260;
    colorFunction: ColorFunc;
    public center: boolean = false;

    get text(): string {
        return this._text;
    }

    set text(value:string) {
        this._text = value;
        if (this.tf) O.rp(this.tf);
        this.tf = this.getTextBox(value, this.tooltip, this.maxWidth);
        this.gfx.addChild(this.tf);
    }

    static TextColor(obj: any, word: string): any {
        let color = 0xffffff;
        let wreturn = word;
        if (wreturn.indexOf("@red") >= 0) {
            color = 0xff0000;
            wreturn =  wreturn.replace("@red", "");
        }

        return {color: color, word: wreturn}
    }

    getTextBox(text: string, tooltip: Tooltip, maxWidth: number): PIXI.Container {
        return tooltip.makeTooltip(text, maxWidth, 260, {}, this.colorFunction, "smallfontx1", 1, this.center);
    }

    process() {
        super.process()
    }

    static DefaultColorFunc(obj: any, word: string): any {
        let color = 0xffffff;
        let wreturn = word;

        if (word.indexOf('@red') == 0) {
            color = 0xff5555;
            wreturn = word.substr(4);
        }

        if (word.indexOf('@r') == 0) {
            color = 0xff5555;
            wreturn = word.substr(2);
        }

        if (word.indexOf('@l') == 0 || word.indexOf('@y') == 0) {
            color = 0xffff99;
            wreturn = word.substr(2);
        }

        return {color: color, word: wreturn}
    }

    init(props: any) {
        this.colorFunction = ColorTextBox.DefaultColorFunc;
        this.tooltip = new Tooltip([0,0]);
        this.maxWidth = props["maxwidth"] ? props["maxwidth"] : 200;
        this.gfx = new PIXI.Container();
        this.pos[0] -= this.width / 2;
        this.pos[1] -= this.height / 2 ;
        this.gfx.position.x = Math.round(this.gfx.position.x);
        this.gfx.position.y = Math.round(this.gfx.position.y);

        let gfx = this.layer ? this.layer : Application.One.sm.gui;
        gfx.addChild(this.gfx);
        this.text = props.text;
    }

}

