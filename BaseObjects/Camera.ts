/**
 * Created by MSI on 04.01.2017.
 */
import {CAMERA_MODE, O} from "./O";
import {m, Vec2} from "../Math";
import {Application, Power2, Power3, TweenMax} from "../Application";
import {CameraZoom} from "../../Stages/Game";

export class Camera extends O {
    setTo(z : CameraZoom, dur: number = .8, ease = Power2.easeOut): any {
        console.log("zooming camera to", z.zoom);
        TweenMax.killTweensOf(this);

        let tween: any = {
            zoom: z.zoom,
            ease: ease,
        };

        let tween2 : any ={
            y: z.posY,
            ease: Power3.easeOut,
        };

        if (z.posX) tween2.x = z.posX;

        TweenMax.to(this, dur, tween);
        TweenMax.to(this, dur*2, tween2);
    }
    private anchorDelta: Vec2 = [0,0];
    public layerOfsX: number;
    public layerOfsY: number;

    public boundaries: PIXI.Bounds;

    get zoom(): number {
        return this._zoom;
    }

    set zoom(value: number) {
        this._zoom = value;
        this.layerOfsX = Application.One.SCR_WIDTH * (1 - this._zoom) / 2;
        this.layerOfsY = Application.One.SCR_HEIGHT * (1 - this._zoom) / 2;
        let app = Application.One;
        app.sm.main.x = this.layerOfsX;
        app.sm.main.y = this.layerOfsY;
        app.sm.main.scale.x = value;
        app.sm.main.scale.y = value;

        app.sm.uppermain.x = this.layerOfsX;
        app.sm.uppermain.y = this.layerOfsY;
        app.sm.uppermain.scale.x = value;
        app.sm.uppermain.scale.y = value;

        app.sm.olgui.scale.x = value;
        app.sm.olgui.scale.y = value;
        app.sm.olgui.x = this.layerOfsX;
        app.sm.olgui.y = this.layerOfsY;

        app.sm.effects.scale.x = value;
        app.sm.effects.scale.y = value;
        app.sm.effects.x = this.layerOfsX;
        app.sm.effects.y = this.layerOfsY;

    }
    private baseY: number;

    public operator: boolean = false;
    private voX:number = 0;
    private voY:number = 0;
    private followObj: O;
    private rect: PIXI.Rectangle;
    private boardLU: Vec2 = [0, 0];
    private boardRD: Vec2 = [0, 0];
    private _zoom: number = 1;

    follow(o: O) {
        this.followObj = o;
    }

    makeShake(powerPercentage: number, duration: number): void {
        TweenMax.to(this, duration, {zoom: this.zoom * (1 + powerPercentage), yoyo: true, repeat: 1, ease: Power2.easeOut});
    }

    constructor(pos: Vec2) {
        super(pos);
        this.zoom = 1;
        this.removeable = false;
        this.rect = new PIXI.Rectangle(0, 0, Application.One.SCR_WIDTH, Application.One.SCR_HEIGHT);
    }

    stop() {
        this.v[0] = 0;
        this.v[1] = 0;
    }

    t(oldP:Vec2) {
        return [oldP[0] - this.pos[0], oldP[1] - this.pos[1]];
    }

    onDestroy() {
        super.onDestroy();

        this.followObj = null;
    }

    boundaryCheck(p: Vec2) {
        if (p[0] < this.boardLU[0]) {
            p[0] = this.boardLU[0];
        }

        if (p[1] < this.boardLU[1]) {
            p[1] = this.boardLU[1];
        }

        if (p[0] > this.boardRD[0]) {
            p[0] = this.boardRD[0];
        }

        if (p[1] > this.boardRD[1]) {
            p[1] = this.boardRD[1];
        }
    }

    reset(x, y, doBoundaryCheck) {
        this.v[0] = 0;
        this.v[1] = 0;
        this.followObj = null;
        this.pos[0] = x;
        this.pos[1] = y;

        /*if (doBoundaryCheck) {
            this.boundaryCheck(this.pos)
        }*/

        this.voX = 0;
        this.voY = 0;
    }

    worldToScreen(s: Vec2): Vec2 {
        let centrObjCoordX = this.pos[0] - Application.One.SCR_WIDTH * 0.5;
        let centrObjCoordY = this.pos[1] - Application.One.SCR_HEIGHT * 0.5;

        return [s[0] - centrObjCoordX, s[1] - centrObjCoordY];
    }

    screenToWorld(s: Vec2): Vec2 {
        let centrObjCoordX = this.pos[0] - Application.One.SCR_WIDTH * 0.5;
        let centrObjCoordY = this.pos[1] - Application.One.SCR_HEIGHT * 0.5;

        return [s[0] + centrObjCoordX, s[1] + centrObjCoordY];
    }

    focusPlace(worldPos:Vec2) {
        let app = Application.One;
        let prevPos = [this.pos[0], this.pos[1]];
        TweenMax.killChildTweensOf(app.sm.camera, true);
        TweenMax.killChildTweensOf(this, true);
        console.log("FOCUS PLACE");
        new TweenMax(this, .6, {x: worldPos[0], y: worldPos[1]});
        new TweenMax(app.sm.camera, .6, {z : 20});
        new TweenMax(this, 0.5, {delay: 0.6, x: prevPos[0], y: prevPos[1]});
        new TweenMax(app.sm.camera, 0.5, {delay: 0.6, z: 0});
    }

    updateTransform(obj:O, clip: PIXI.DisplayObject, offsX:number = 0, offsY:number = 0) {
        switch (obj.CameraMode){
            case CAMERA_MODE.CM_UPDATE_NO_OFFSET:
                clip.x = obj.pos[0] + offsX;
                clip.y = obj.pos[1] + offsY;
                break;
            case CAMERA_MODE.CM_UPDATE:
                clip.x = obj.pos[0] - this.pos[0] + Application.One.SCR_WIDTH_HALF;
                clip.y = obj.pos[1] - this.pos[1] + Application.One.SCR_HEIGHT_HALF;
                break;
        }

        //if (clip.visible) {
        //    clip.rotation = obj.a  + this.a;
        //}
    }

    offsetX(): number {
        return this.pos[0] - Application.One.SCR_WIDTH_HALF
    }

    offsetY(): number {
        return this.pos[1] - Application.One.SCR_HEIGHT_HALF
    }


    process() {
        if (this.boundaries) {
            this.x = this.checkXBoundary(this.boundaries);
            this.y = this.checkYBoundary(this.boundaries);
        }
    }

    public isVisible(g: PIXI.DisplayObject) {
        g.getBounds(false, this.rect);
        let gg: any = g;
        if (gg.anchor && gg.anchor.x != 0.5 && gg.anchor.y != 0.5) {
            this.anchorDelta[0] = (gg.anchor.x - 0.5)*gg.width;
            this.anchorDelta[1] = (gg.anchor.y - 0.5)*gg.height;
            m.rv2fast(this.anchorDelta, g.rotation);
        } else {
            this.anchorDelta[0] = 0;
            this.anchorDelta[1] = 0;
        }
        return ((Math.abs(g.position.x - Application.One.SCR_WIDTH_HALF - this.anchorDelta[0]) <= this.rect.width + Application.One.SCR_WIDTH_HALF/this._zoom) && (Math.abs(g.position.y - Application.One.SCR_HEIGHT_HALF - this.anchorDelta[1]) <= this.rect.height + Application.One.SCR_HEIGHT_HALF/this._zoom))
    }

    hitAnimation(charPos: Vec2) {
        //let pos = [(charPos[0] - this.pos[0]) / 15, (charPos[1] - this.pos[1]) / 15];

        //new TweenMax(this, 0.25, {x: this.pos[0] + pos[0], zoom: DEFAULT_ZOOM + .05, yoyo: true, repeat: 1});
    }


    worldScreenToUI(p: Vec2): Vec2 {
        p[0] -= Application.One.SCR_WIDTH_HALF * (1 - this.zoom);
        p[1] -= Application.One.SCR_HEIGHT_HALF * (1 - this.zoom);
        return p;
    }

    transformPoint(point: Vec2, dir: number, pos2: any) {
        pos2[0] = point[0] + (- this.pos[0] + Application.One.SCR_WIDTH_HALF)*dir;
        pos2[1] = point[1] + (- this.pos[1] + Application.One.SCR_HEIGHT_HALF)*dir;
    }

    private checkYBoundary(boundaries: PIXI.Bounds): number {
        let h = Application.One.SCR_HEIGHT / this.zoom;
        let t = this.y + h / 2;
        let b = this.y - h / 2;
        if (t > boundaries.maxY) return boundaries.maxY - h / 2;
        if (b < boundaries.minY) return boundaries.minY + h / 2;

        return this.y;
    }

    private checkXBoundary(boundaries: PIXI.Bounds): number {
        let w = Application.One.SCR_WIDTH / this.zoom;
        let r = this.x + w / 2;
        let l = this.x - w / 2;
        if (r > boundaries.maxX) return boundaries.maxX - w/2;
        if (l < boundaries.minX) return boundaries.minX + w/2;
        
        return this.x;
    }
}

