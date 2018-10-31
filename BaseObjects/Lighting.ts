import {BaseLighting} from "./BaseLighting";
import {Application, Sine, TweenMax} from "../Application";
import {Light} from "./Light";
import {LightFilter} from "../shaders/LightFilter";
import {O} from "./O";
import {m, RGBColor, Vec2} from "../Math";
import {_} from "../../main";

export class Lighting extends BaseLighting {
    private lightingLayer: PIXI.display.Layer;
    public lightFilter: LightFilter;
    private baseScaleX: number;
    private baseScaleY: number;
    public baseLight: RGBColor = [1,1,1];
    public baseIllum: RGBColor = [1,1,1];
    public darkness: number = 1;

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

        this.lightFilter = new LightFilter({saturation: -3, brightness: 0.7,  contrast: 0.5, gamma: 1, lightSampler: this.lightingLayer.getRenderTexture()});
        Application.One.sm.main.filters = [this.lightFilter];
        Application.One.sm.main.filterArea = Application.One.app.screen;
        this.lightFilter.resolution = Application.One.resolution;

        this.ambient.parentLayer = this.lightingLayer;
        this.layer.addChild(this.ambient);


        if (props['darkness']) {
            this.darkness = parseFloat(props['darkness']);
        }

        if (props['color']) {
            this.baseLight = m.numhexToRgbNormal(props['color'].replace('#', '0x'));
        }
        if (props['illum']) {
            this.baseIllum = m.numhexToRgbNormal(props['illum'].replace('#', '0x'));
        }

        this.set(this.baseLight, this.baseIllum);
        this.updateLights();
        this.redraw();


        this.process();

        console.log("Init new light");
    }

    public updateLights() {
   //     _.app.renderer.bindRenderTexture(this.lightingLayer.getRenderTexture());
   //     _.app.renderer.clear();
   //        this.lightingLayer.getRenderTexture().
   //     let par = this.lightingLayer.parent;
   //     par.removeChild(this.lightingLayer);
   //     par.addChild(this.lightingLayer);
        for (let x = 2; x < this.lightingLayer.children.length; ++x) {//SKIP AMBIENT + LAYER CONTAINER
            let c = this.lightingLayer.children[x];
            c.parentLayer = null;
            O.rp(c);
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
        this.layer.addChild(l.gfx);
        if (l.properties && !l.properties["blendMode"])
        l.gfx.blendMode = PIXI.BLEND_MODES.ADD;
        l.gfx.alpha = this.darkness;
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