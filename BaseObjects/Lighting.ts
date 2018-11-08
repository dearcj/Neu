import {BaseLighting} from "./BaseLighting";
import {Application, Sine, TweenMax} from "../Application";
import {Light} from "./Light";
import {LightFilter} from "../shaders/LightFilter";
import {O} from "./O";
import {ARGBColor, m, RGBColor, Vec2} from "../Math";
import {_} from "../../main";
import {extractBlendMode} from "../Loader";
import BlendMode = PIXI.spine.core.BlendMode;

export class Lighting extends BaseLighting {
    get brightness(): number {
        return this._brightness;
    }

    set brightness(value: number) {
        this._brightness = value;
        this.lightFilter.uniforms.brightness = value;
    }
    get gamma(): number {
        return this._gamma;
    }

    set gamma(value: number) {
        this._gamma = value;
        this.lightFilter.uniforms.gamma = value;
    }
    private _gamma: number;
    private _brightness: number;

    get contrast(): number {
        return this._contrast;
    }

    set contrast(value: number) {
        this._contrast = value;
        this.lightFilter.uniforms.contrast = value;
    }

    get saturation(): number {
        return this._saturation;
    }

    set saturation(value: number) {
        this._saturation = value;
        this.lightFilter.uniforms.saturation = value;
    }

    private lightingLayer: PIXI.display.Layer;
    public lightFilter: LightFilter;
    private baseScaleX: number;
    private baseScaleY: number;
    public baseLight: RGBColor = [1,1,1];
    public baseIllum: RGBColor = [1,1,1];
    public darkness: number = 1;
    private blendMode: number;

    private _saturation: number;
    private _contrast: number;

    onDestroy() {
        O.rp(this.ambient);
        super.onDestroy();
    }

    init(props: any) {
        this.alwaysVisible = true;
        this.ambient = <PIXI.heaven.Sprite>Application.One.cs(BaseLighting.DEFAULT_GFX);
        this.ambient.width = Application.One.SCR_WIDTH;
        this.ambient.height = Application.One.SCR_HEIGHT;
        this.envColor = this.defaultColor;

        this.baseScaleX = this.ambient.scale.x;
        this.baseScaleY = this.ambient.scale.y;

        this.lightingLayer = new PIXI.display.Layer();
        this.lightingLayer.useRenderTexture = true;
        this.layer.addChild(this.lightingLayer);

        this.lightFilter = new LightFilter({saturation: 0, brightness: 0.,  contrast: 0., gamma: 1, lightSampler: this.lightingLayer.getRenderTexture()});

        this.saturation = -3;
        if (props["saturation"]) {
            this.saturation = parseFloat(props["saturation"]);
        }

        this.contrast = 0.5;
        if (props["contrast"]) {
            this.contrast = parseFloat(props["contrast"]);
        }

        this.gamma = 1;
        if (props["gamma"]) {
            this.gamma = parseFloat(props["gamma"]);
        }

        this.brightness = 1;
        if (props["brightness"]) {
            this.brightness = parseFloat(props["brightness"]);
        }

        Application.One.sm.main.filters = [this.lightFilter];
        Application.One.sm.main.filterArea = Application.One.app.screen;
        this.lightFilter.resolution = Application.One.resolution;

        this.ambient.parentLayer = this.lightingLayer;
        this.layer.addChild(this.ambient);

        this.blendMode = PIXI.BLEND_MODES.ADD;
        if (props && !props["blendmode"])
            this.blendMode = PIXI.BLEND_MODES.ADD; else
            this.blendMode = extractBlendMode(props["blendmode"]);

        if (props['darkness']) {
            this.darkness = parseFloat(props['darkness']);
        }

        if (props['color']) {
            this.baseLight = m.ARGBtoRGB(m.hexToRgb(props['color']));
        }
        if (props['illum']) {
            this.baseIllum = m.ARGBtoRGB(m.hexToRgb(props['illum']));
        }
        this.wait(0).call(this.updateLights.bind(this)).apply();
        this.redraw();
        this.set(this.baseLight, this.baseIllum);

        this.process();
    }

    public updateLights() {
        if (this.lights) {
            for (let x of this.lights) {//SKIP AMBIENT + LAYER CONTAINER
                if (x.gfx) {
                    x.gfx.parentLayer = null;
                    O.rp(x.gfx);
                }
            }
        }

        this.lights = <Array<Light>>Application.One.sm.findByType(Light);
        for (let x of this.lights) {
            this.addLight(x)
        }
    }

    tweenColorTo(col: RGBColor, illum: RGBColor = null, deltaTimeSec: number = 1.9) {
        TweenMax.to(this.lightFilter.uniforms, deltaTimeSec, {red: col[0]*this.baseLight[0],
            green: col[1]*this.baseLight[1],
            blue: col[2]*this.baseLight[2],
        });

        if (illum)
        TweenMax.to(this.ambient.color, deltaTimeSec, {lightR: illum[0]*this.baseIllum[0], lightG: illum[1]*this.baseIllum[1], lightB: illum[2]*this.baseIllum[2]});
    }

    public redraw() {
    }

    addLight(l: Light): void {
        if (l.stringID)
        console.log("Added light [", l.stringID, "]");

        l.gfx.parentLayer = null;
        O.rp(l.gfx);
        l.gfx.stringID = l.stringID;
        l.gfx.blendMode = this.blendMode;

        l.gfx.alpha = l.baseAlpha * this.darkness;
        l.gfx.parentLayer = this.lightingLayer;
        this.layer.addChild(l.gfx);
    }

    process() {
        this.ambient.x = -Application.One.SCR_WIDTH * (-0.5 );
        this.ambient.y = -Application.One.SCR_HEIGHT * (-0.5 );
        this.ambient.scale.x = (this.baseScaleX / Application.One.sm.camera.zoom);// -_.sm.camera.x - _.SCR_WIDTH_HALF;
        this.ambient.scale.y = (this.baseScaleY / Application.One.sm.camera.zoom);// -_.sm.camera.y - _.SCR_HEIGHT_HALF;

        this.redraw();
    }

    set(col: RGBColor, illum: RGBColor = null) {
        this.lightFilter.uniforms.red = col[0];
        this.lightFilter.uniforms.green = col[1];
        this.lightFilter.uniforms.blue = col[2];

        if (illum)
        this.ambient.color.setLight(illum[0], illum[1], illum[2]);
    }
}