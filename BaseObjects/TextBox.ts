/**
 * Created by MSI on 05.01.2017.
 */
import {IO} from "./IO";
import {HeavenBitmapText} from "../PIXIPlugins/HeavenBitmapText";
import {Application} from "../Application";
/**
 * Created by KURWINDALLAS on 11.07.2014.
 *////

const DEFAULT_FONT = 'Berkshire-export';

export class TextBox extends IO {

    static hashCode(str) { // java String#hashCode
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return hash;
    }

    static convertSpaces(a) {
        let c = a.match(/==/g);
        return a.replace(/==/g, '\n');
    }

    static createTextField(obj, props: any): HeavenBitmapText {
        let fontName: string;
        if (props.fontName) {
            fontName = props.fontName;
        } else {
            fontName = DEFAULT_FONT;
        }

        obj.text = props.text;
        if (obj.text) {
            obj.text = this.convertSpaces(obj.text);
        }

        if (obj.text == undefined) obj.text = "";

        let pt = new HeavenBitmapText(obj.text, {font: fontName});
        (<any>pt).fontInitialSize = (<any>pt.font).size;
        if (props.fontscale && props.fontscale != '') {
            (<any>pt.font).size = (<any>pt).fontInitialSize * parseFloat(props.fontscale)
        }

        pt.y = 0;
        pt.x = 0;
        //pt.bitmap = true;
        pt.scale.x = pt.scale.y;

        if (props.fontTint != "0xffffff" && props.fontTint != undefined)
            pt.tint = parseInt(props.fontTint);
        (<PIXI.Point>pt.anchor).x = 0.5;
        return pt;
    }

    process() {
        super.process()
    }

    onDestroy() {
        super.onDestroy();
    }

    init( props: any) {
        this.gfx = new PIXI.Container();
        this.pos[0] -= this.width / 2;
        this.pos[1] -= this.height / 2 ;
        this.noCameraOffset = true;

            super.init(props);
        this.textField = TextBox.createTextField(this, props);
        this.fontInitialSize = this.textField.maxLineHeight;


        this.gfx.position.x = Math.round(this.gfx.position.x);
        this.gfx.position.y = Math.round(this.gfx.position.y);

        if (props.color && this.gfx) {
            this.textField.tint = parseInt(props.color.replace('#', '0x'));
        }


        this.gfx.addChild(this.textField);
        let gfx = this.layer ? this.layer : Application.One.sm.gui;
        gfx.addChild(this.gfx);
        this.text = this.text;
    }



}

