import {O} from "./O";
import {Camera} from "./Camera";
import {m, Vec2, ARGBColor, RGBColor} from "../Math";
import {Light} from "./Light";
import {Application, Sine, TweenMax} from "../Application";
import {_} from "../../main";
import {MAX_SCR_HEIGHT, MAX_SCR_WIDTH} from "../../ClientSettings";
import {LightFilter} from "../shaders/LightFilter";

export class BaseLighting extends O {
    static DEFAULT_GFX: string;
    protected tweenStart: any;
    lerp: number;
    protected tweenDest: any;
    protected tweenStartDark: RGBColor;
    protected tweenDestDark: RGBColor;

    public ambient: PIXI.heaven.Sprite;
    public ambientContainer: PIXI.Container;
    public envColor: ARGBColor = [1, 1, 1, 1];
    public envColorDark: ARGBColor = [1, 0, 0, 0];
    public defaultColor: ARGBColor = [1, 1, 1, 1];
    public lights: Light[] = [];
    protected filterArea: PIXI.Rectangle;
    public illum: RGBColor = [0.5, 0.5, 0.5];

    onDestroy() {
        if (this.gfx) {
            this.gfx.filters[0].blendMode = PIXI.BLEND_MODES.NORMAL;
            this.gfx.filters = null;
            this.gfx.filterArea = null;

            TweenMax.killTweensOf(this);
        }

        _.rp(this.ambientContainer);
        this.ambientContainer = null;
        this.ambient = null;
        this.lights = [];

        console.log("LIGHT DESTROYED");

        super.onDestroy();
    }

    addLight(l: Light): void {
        l.gfx.blendMode = PIXI.BLEND_MODES.ADD;
        _.rp(l.gfx);
        this.addChild(l);
    }

    tweenColorTo(col: RGBColor, darkCol: RGBColor = null, deltaTimeSec: number = 0.9) {
     /*   this.lerp = 0;
        let obj: any = {
            ease: Sine.easeOut, lerp: 1, onComplete: () => {
                this.tweenDest = null;
            }
        };

        if (repeat) {
            obj.yoyo = true;
            obj.repeat = -1;
        }

        TweenMax.to(this, deltaTimeSec, {envColor: col});

        if (darkCol)
        TweenMax.to(this, deltaTimeSec, {illum: darkCol});*/
    }

    updateEnvironmentColor(col: ARGBColor) {
    }


    init(props: any) {
        super.init(props);
        this.alwaysVisible = true;
        let delta = 0;
        this.filterArea = new PIXI.Rectangle(-delta, -delta, Application.One.SCR_WIDTH + 2 * delta, Application.One.SCR_HEIGHT + 2 * delta);
        this.gfx = Application.One.cc();
        this.ambient = <PIXI.heaven.Sprite>Application.One.cs(BaseLighting.DEFAULT_GFX);
        this.ambient.anchor.x = 0.5;
        this.ambient.anchor.y = 0.5;
        this.ambient.x = Application.One.SCR_WIDTH / 2;
        this.ambient.y = Application.One.SCR_HEIGHT/ 2;
        this.ambient.width = Application.One.SCR_WIDTH;
        this.ambient.height = Application.One.SCR_HEIGHT;
        this.ambientContainer = new PIXI.Container();
        this.ambientContainer.addChild(this.ambient);
        this.envColor = this.defaultColor;
        this.gfx.addChild(this.ambientContainer);
        this.layer.addChild(this.gfx);

        let lf = new LightFilter(null);
        this.layer.filters = [lf];

        this.gfx.filters = [new PIXI.filters.AlphaFilter()];
        this.gfx.filterArea = this.filterArea;
        this.gfx.filters[0].blendMode = PIXI.BLEND_MODES.MULTIPLY;
        this.redraw();
        this.updateLights();
    }

    process() {
        this.gfx.x = -_.sm.camera.x + MAX_SCR_WIDTH / 2;//c.offset[0];
        this.gfx.y = -_.sm.camera.y + MAX_SCR_HEIGHT / 2;//c.offset[1];
        if (this.tweenDest) {
            let l = this.lerp;
            let il = 1 - this.lerp;
            this.envColor[1] = this.tweenStart[0] * il + l * this.tweenDest[0];
            this.envColor[2] = this.tweenStart[1] * il + l * this.tweenDest[1];
            this.envColor[3] = this.tweenStart[2] * il + l * this.tweenDest[2];


            this.envColorDark[1] = this.tweenStartDark[0] * il + l * this.tweenDestDark[0];
            this.envColorDark[2] = this.tweenStartDark[1] * il + l * this.tweenDestDark[1];
            this.envColorDark[3] = this.tweenStartDark[2] * il + l * this.tweenDestDark[2];

            this.redraw();
        }
    }

    public updateLights() {
        for (let x = 1; x < this.gfx.children.length; ++x) {//SKIP AMBIENT CONTAINER
            _.rp(x);
        }

        this.lights = <Array<Light>>Application.One.sm.findByType(Light);
        for (let x of this.lights) {
            this.addLight(x)
        }
    }

    public redraw() {
        this.gfx.color.setLight(this.envColor[1], this.envColor[2], this.envColor[3]);
        this.gfx.color.setDark(this.envColorDark[1], this.envColorDark[2], this.envColorDark[3]);
    }
}