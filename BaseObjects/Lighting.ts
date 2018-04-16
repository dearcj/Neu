import {O} from "./O";
import {Camera} from "./Camera";
import {m, Vec2, ARGBColor} from "../Math";
import {Light} from "./Light";
import {Application, Sine, TweenMax} from "../Application";

export class Lighting extends O {
    private tweenStart: any;
    lerp: number;
    private tweenDest: any;

    get envColor(): ARGBColor {
        return this._envColor;
    }

    set envColor(col: ARGBColor) {
        this._envColor = col;
     }

    public ambient: PIXI.heaven.Sprite;
    public ambientContainer: PIXI.Container;
    private _envColor: ARGBColor;
    public defaultColor: ARGBColor = [255, 150, 150, 150];

    public static colBattle: ARGBColor;
    public static colRegular: ARGBColor;

    public lights: Light[] = [];
    private filterArea: PIXI.Rectangle;

    onDestroy() {
        this.gfx.filters[0].blendMode = PIXI.BLEND_MODES.NORMAL;
        this.gfx.filters = null;
        this.gfx.filterArea = null;

        TweenMax.killTweensOf(this);
        O.rp(this.ambientContainer);
        this.ambientContainer = null;
        this.ambient = null;
        this.lights = [];

        console.log("LIGHT DESTROYED");

        super.onDestroy();
    }

    addLight(l: Light): void {
        l.gfx.blendMode = PIXI.BLEND_MODES.ADD;
        O.rp(l.gfx);
        this.gfx.addChild(l.gfx);
    }

    tweenColorTo(col: ARGBColor, repeat: boolean = false, deltaTimeSec: number = 0.9) {
        this.tweenStart = [this.envColor[0], this.envColor[1], this.envColor[2], this.envColor[3]];
        this.tweenDest = col;
        this.lerp = 0;
        let obj: any = {
            ease: Sine.easeOut, lerp: 1, onComplete: () => {
                this.tweenDest = null;
            }
        };

        if (repeat) {
            obj.yoyo = true;
            obj.repeat = -1;
        }
        new TweenMax(this, deltaTimeSec, obj);
    }
    makeLightsDown() {
        this.tweenColorTo([0, 170, 170, 150]);
    }

    makeSocialLight() {
        this.tweenColorTo([0, 180, 130, 180]);
    }

    makeBattleMode() {
        this.tweenColorTo(Lighting.colBattle);
    }

    makeRegularMode() {
        this.tweenColorTo(Lighting.colRegular);
    }


    updateEnvironmentColor(col: ARGBColor) {
    }

    updateLight(): void {
        for (let x of this.lights) {
            //WE CAN REMOVE PREV SCENE WITH LIGHTS...
            if (!x.doRemove && x.gfx.visible) {
                x.gfx.x = x.pos[0] - Application.One.sm.camera.offset[0];
                x.gfx.y = x.pos[1] - Application.One.sm.camera.offset[1];
            }
        }
    }

    init(props: any) {
        super.init(props);
        this.alwaysVisible = true;
        let delta = 0;
        this.y = 1200;
        this.filterArea = new PIXI.Rectangle(-delta, -delta, Application.One.SCR_WIDTH + 2 * delta, Application.One.SCR_HEIGHT + 2 * delta);
        this.gfx = new PIXI.Sprite();
        this.ambient = <PIXI.heaven.Sprite>Application.One.cs('Camera-Shadow.png');
        this.ambient.anchor.x = 0;
        this.ambient.anchor.y = 0;
        this.ambient.width = Application.One.SCR_WIDTH;
        this.ambient.height = Application.One.SCR_HEIGHT;
        this.ambientContainer = new PIXI.Container();
        this.ambientContainer.addChild(this.ambient);
        console.log("ADDED LIGHT");
        this.envColor = this.defaultColor;
        this.gfx.addChild(this.ambientContainer);
        this.layer.addChild(this.gfx);

        this.gfx.filters = [new PIXI.filters.AlphaFilter()];
        this.gfx.filterArea = this.filterArea;
        this.gfx.filters[0].blendMode = PIXI.BLEND_MODES.MULTIPLY;
        this.redraw();
        this.updateLights();
    }

    process() {
        this.gfx.x = 0;//c.offset[0];
        this.gfx.y = 0;//c.offset[1];
        if (this.tweenDest) {
            let l = this.lerp;
            let il = 1 - this.lerp;
            this.envColor = [this.tweenStart[0] * il + l * this.tweenDest[0],
                this.tweenStart[1] * il + l * this.tweenDest[1],
                this.tweenStart[2] * il + l * this.tweenDest[2],
                this.tweenStart[3] * il + l * this.tweenDest[3]];
            //console.log(this.envColor);
            this.redraw();
        }
    }

    public updateLights() {
        for (let x = 1; x < this.gfx.children.length; ++x) {//SKIP AMBIENT CONTAINER
            O.rp(x);
        }

        this.lights = <Array<Light>>Application.One.sm.findByType(Light);
        for (let x of this.lights) {
            this.addLight(x)
        }
    }

    public redraw() {
        this.ambient.color.setLight(this.envColor[1] / 255, this.envColor[2] / 255, this.envColor[3] / 255);
    }
}