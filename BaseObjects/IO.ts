/**
 * Created by MSI on 04.01.2017.
 */
//Interface object
import { _, PIXIContainer} from "../../main";
import {O} from "./O";
import {Camera} from "./Camera";
import BitmapText = PIXI.extras.BitmapText;
import {HeavenBitmapText} from "../PIXIPlugins/HeavenBitmapText";

export class IO extends O {
    private _fontScale: number = 1;
    fontInitialSize: number = 20;

    public textField: HeavenBitmapText;
    private _click: Function;
    protected _text: string;
    public align: string;
    public valign: string;
    public fontSize: string;
    public focused: boolean;
    public focusGfx: PIXI.Container;
    public enabled: boolean = true;
    public textFieldOffsetX: number = 0;
    public textFieldOffsetY: number = 0;
    public hoverMode: boolean = false;
    public soundName: string = "click2";

    get fontScale(): number {
        return this._fontScale;
    }

    set fontScale(value: number) {
        if (this.doRemove) return;
        this._fontScale = value;
        let f: any = this.textField.font;
        f.size = this.fontInitialSize  * value;
        let tf: any = this.textField;
        this.text = this.text;
        tf.updateText();
    }


    toggleHoverAnimation(mode: boolean): void{
        this.hoverMode = mode;
    }

    enable(mode: boolean): void{
        this.enabled = mode;
        if (mode) {
            this.toggleHoverAnimation(this.hoverMode);
            if (this.gfx instanceof PIXI.heaven.Sprite) {
                (<PIXI.heaven.Sprite>this.gfx).color.setLight(1,1,1);
            }
        } else {
            this.toggleHoverAnimation(false);
            if (this.gfx instanceof PIXI.heaven.Sprite) {
                (<PIXI.heaven.Sprite>this.gfx).color.setLight(0.5, 0.5, 0.5);
            }
        }
    }

    setFocus(v: boolean): void{
        this.focusGfx.visible = v;
        this.focused = v;
    }

    getFocus(): boolean{
        return this.focused;
    }

    get text(): string {
        return this._text;
    }


    set text(value:string) {
        this._text = value;
        if (this.textField) {
            this.textField.text = this._text;
            let tf: any = this.textField;
            tf.updateText();
            let b = this.textField.getLocalBounds();
            if (this.valign =='center') {
                this.textField.y = 0 + this.textFieldOffsetY - this.textField.textHeight / 2 ;
            } else {
                this.textField.y =  -this.textField.maxLineHeight + this.textField.textHeight / 2 + this.textFieldOffsetY;
            }

            if (this.align == "right") {
                this.textField.x = this.width - b.width / 2 + this.textFieldOffsetX;
            } else if (this.align == "left") {
                this.textField.x = this.textField.textWidth / 2+ this.textFieldOffsetX;
            } else {
                this.textField.x = this.width / 2+ this.textFieldOffsetX;//-b.width / 2;
            }

        }

    }

    get click(): Function {
        return this._click;
    }

    set click(v: Function) {
        this._click = v;
        if (!v)
        {
            this.gfx.tap = null;
            this.gfx.click = null;
        } else
        if (this.gfx)
        {
            let a = (evt) => {
                if( this.enabled) {
                    _.sound.play(this.soundName);
                    v(evt);
                }
            };

            this.gfx.tap = a;
            this.gfx.click = a;
        }
    }

    init(props: any) {
        this.noCameraOffset = true;
        this.valign = (props && props.valign) ? props.valign : 'center';
        super.init(props);
//        let spr1 = _.cs('Clock_Red.png');
  //      let spr2 = _.cs('Clock_Red.png');
    //    spr1.scale.x = .33;
      //  spr1.scale.y = .33;
      //  spr2.scale.x = .33;
      //  spr2.scale.y = .33;
      //  spr1.x = -75;
      //  spr2.x = 75;
        if (props && props.align)
            this.align = props.align; else {
                this.align = "center"
        }
        this.focusGfx = new PIXI.Container();
    //    this.focusGfx.addChild(spr1);
    //    this.focusGfx.addChild(spr2);
        this.setFocus(false);
        this.gfx.addChild(this.focusGfx);
    }


    onDestroy() {
        this.click = null;
        if (this.textField) {
            this.textField.parent.removeChild(this.textField);
            this.textField = null;
        }

        super.onDestroy();
    }
}


