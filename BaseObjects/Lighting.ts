import {BaseLighting} from "./BaseLighting";
import {Application, Sine, TweenMax} from "../Application";
import {Light} from "./Light";
import {LightFilter} from "../shaders/LightFilter";
import {O} from "./O";
import {RGBColor} from "../Math";

export class Lighting extends BaseLighting {
    private lightingLayer: PIXI.display.Layer;
    public lightFilter: LightFilter;
    private baseScaleX: number;
    private baseScaleY: number;


    onDestroy() {
        O.rp(this.ambient);
        super.onDestroy();
    }

    init(props: any) {
        this.alwaysVisible = true;
        let delta = 0;
        this.ambient = <PIXI.heaven.Sprite>Application.One.cs(BaseLighting.DEFAULT_GFX);
        this.ambient.width = Application.One.SCR_WIDTH;
        this.ambient.height = Application.One.SCR_HEIGHT;
        this.envColor = this.defaultColor;

        this.baseScaleX = this.ambient.scale.x;
        this.baseScaleY = this.ambient.scale.y;

        this.lightingLayer = new PIXI.display.Layer();
        this.lightingLayer.useRenderTexture = true;
        this.layer.addChild(this.lightingLayer);

        this.lightFilter = new LightFilter({saturation: -3, brightness: 0.7,  contrast: 0.5, gamma: 1, lightSampler: this.lightingLayer.getRenderTexture()});
        Application.One.sm.main.filters = [this.lightFilter];
        Application.One.sm.main.filterArea = Application.One.app.screen;
        this.lightFilter.resolution = Application.One.resolution;

        this.ambient.parentLayer = this.lightingLayer;
        this.layer.addChild(this.ambient);

        this.updateLights();
        this.redraw();

        this.process();
    }

    public updateLights() {
        this.lights = <Array<Light>>Application.One.sm.findByType(Light);
        for (let x of this.lights) {
            this.addLight(x)
        }
    }

    tweenColorTo(col: RGBColor, illum: RGBColor = null, deltaTimeSec: number = 1.9) {
        TweenMax.to(this.lightFilter.uniforms, deltaTimeSec, {red: col[0],
            green: col[1],
            blue: col[2],
        });

        if (illum)
        TweenMax.to(this.ambient.color, deltaTimeSec, {lightR: illum[0], lightG: illum[1], lightB: illum[2]});
    }

    public redraw() {
    }

    addLight(l: Light): void {
        O.rp(l.gfx);
        this.layer.addChild(l.gfx);
        if (!l.properties["blendMode"])
        l.gfx.blendMode = PIXI.BLEND_MODES.ADD;
        l.gfx.parentLayer = this.lightingLayer;
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