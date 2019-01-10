import {O} from "./BaseObjects/O";
import {Camera} from "./BaseObjects/Camera";
import {binarySearch, Vec2} from "./Math";
import {$DEBUG, Application} from "./Application";
import {ITransition} from "./Transitions/ITransition";
import {BlackTransition} from "./Transitions/BlackTransition";
import {_, PIXIUI} from "../main";
import {Stage} from "./Stage";
import {AnimClip} from "./PIXIPlugins/AnimClip";

export const POOL_TAG_SPRITE = "sprite";
export const POOL_TAG_HEAVEN_SPRITE = "heaven_sprite";
export const POOL_TAG_CONTAINER = "container";
export const POOL_TAG_GRAPHICS = "graphics";
export const POOL_TAG_ANIM_CLIP = "anim";

export class SM {
    public pool:  { [key:string]: any; } = {};

    public superstage: PIXI.Container;
    public pixiUiStage: any;

    public main: PIXI.Container;
    public gui: PIXI.Container;
    public gui2: PIXI.Container;
    public olgui: PIXI.Container;
    public fonts: PIXI.Container;

    public giuPixiUiContainer: any;
    public camera: Camera;
    public stage: Stage = null;
    private prevStage: any = null;
    private inTransit: boolean = false;
    public loading: boolean = false;
    public objects: Array<O> = [];
    public static: Array<PIXI.Container> = [];
    public walls: Array<O> = [];
    public dynamic: Array<O> = [];
    public cursorlayer: PIXI.Container;
    public effects: PIXI.Container;
    public globalIds: { [key: string]: O; } = {};
    private transition: ITransition;
    public light: PIXI.Container;
    public bg: PIXI.Container;

    public camera3d: PIXI.Container;

    public resetObj(obj: any) {
        Application.One.killTweensOf(obj);
        Application.One.killTweensOf(obj.scale);
        obj.removeAllListeners();
        obj.visible = true;
        obj.alpha = 1;
        obj.blendMode = PIXI.BLEND_MODES.NORMAL;

        if (obj._activeParentLayer) {
            obj.parentLayer = null;
            obj._activeParentLayer = null;
        }

        obj.cacheAsBitmap = false;
        obj.interactive = false;
        obj.interactiveChildren = false;
        obj.x = 0;
        obj.y = 0;
        obj.width = 0;
        obj.height = 0;
        obj.rotation = 0;


        obj.setTransform(0,0,0,0,0,0,0,0,0);

        if (obj instanceof PIXI.DisplayObject) {
            obj.buttonMode  = false;
            obj.hitArea = null;
        }

        if (obj instanceof PIXI.Graphics) {
            (<PIXI.Graphics>obj).tint = 0xffffff;
            (<PIXI.Graphics>obj).clear();
        }

        if (obj instanceof AnimClip) {
            (<any>obj).color.clear();
            (<any>obj).maskSprite = null;
            (<any>obj).maskVertexData = null;
            obj.startFrame = 0;
            obj.mask = null;
            obj.animationSpeed = 1;
            obj.gotoAndStop(1);
            obj.filters = [];
            obj.filterArea = null;
            obj.renderable = true;
        }

        if (obj instanceof PIXI.heaven.Sprite) {
            obj.color = new PIXI.heaven.ColorTransform();
            obj.anchor.x = 0.;
            obj.anchor.y = 0.;
            obj.color.clear();
            obj.tint = 0xffffff;
            obj.filters = [];
            obj.filterArea = null;
            obj.maskSprite = null;
            obj.maskVertexData = null;
            obj.mask = null;
            obj.renderable = true;
        }

        if (obj instanceof PIXI.Sprite) {
            obj.anchor.x = 0.;
            obj.anchor.y = 0.;
            obj.renderable = true;
            obj.filters = [];
            obj.filterArea = null;
            obj.tint = 0xffffff;
            obj.mask = null;
        }
    }

    public poolTag(obj: any): string {
        let tagname: string;


        let constructor = Object.getPrototypeOf(obj).constructor;
        if (constructor == PIXI.Container) {
            tagname = POOL_TAG_CONTAINER;
        }

        if (constructor == AnimClip) {
            tagname = POOL_TAG_ANIM_CLIP;
        }

        if (constructor == PIXI.Graphics) {
            tagname = POOL_TAG_GRAPHICS;
        }

        if (constructor == PIXI.Sprite) {
       //     tagname = POOL_TAG_SPRITE;
        }

        if (constructor == PIXI.heaven.Sprite) {
            tagname = POOL_TAG_HEAVEN_SPRITE;
        }

        return tagname;
    }

    public toPool(obj: any, tagname: string) {
        (<any>obj).inPool = true;
        if (!this.pool[tagname]) {
            this.pool[tagname] = [];
        }

        this.resetObj(obj);
        this.pool[tagname].push(obj);
    }

    public fromPool(tag: string): any {
        if (!this.pool[tag]) {
            return null;
        } else {
            let p = this.pool[tag].shift();
            if (p) {
                p.inPool = null;
            }

            return p;
        }
    }

    public ZOrderContainer(c: PIXI.Container): void {
        c.children.sort(function (a, b) {
            return a.position.y - b.position.y
        })
    }

    public ZUpdate(container: PIXI.Container, c: PIXI.Sprite): void {
        let l: number = binarySearch(container.children, c, function (a, b) {
            return a.position.y - b.position.y
        });
        if (l < 0) { // if the binarySearch return value was zero or positive, a matching object was found
            l = ~l;
        }

        container.setChildIndex(c, Math.min(l + 1, container.children.length - 1))
    }


    public addStatic(gfx: PIXI.Container): void {
        this.static.push(gfx);
    }

    public findByProp(prop: string, list: Array<O> = null): Array<O> {
        if (!list) list = this.objects;
        let res: Array<O> = [];
        for (let o of list)
            if (!o.doRemove && o.properties[prop]) res.push(o);

        return res
    }

    public findMultiple(stringId: string, list: Array<O> = null): Array<O> {
        if (!list) list = this.objects;
        let res: Array<O> = [];
        for (let o of list)
            if (!o.doRemove && o.stringID == stringId) res.push(o);

        return res
    }


    public findOne(stringId: string, list: Array<O> = null): O {
        if (Application.One.sm.globalIds[stringId]) {
            return Application.One.sm.globalIds[stringId];
        }

        if (!list) list = this.objects;
        for (let o of list)
            if (!o.doRemove && o.stringID == stringId) return o;
    }

    public findByTypeOne<T extends O>(constructor: { new (p: Vec2, gfx: any): T }, list: Array<O> = null): T {
        if (!list) list = this.objects;
        for (let o of list) {
            if (!o.doRemove && o instanceof constructor) {
                return <T>o
            }
        }
        return null
    }

    public findByType<T extends O>(constructor: { new (p: Vec2, gfx: any): T }, list: Array<O> = null): Array<T> {
        if (!list) list = this.objects;
        let res: Array<T> = [];
        for (let o of list) {
            if (!o.doRemove && o instanceof constructor) {
                res.push(<T>o)
            }
        }
        return res
    }

    init() {
        this.superstage = new PIXI.Container();

        this.bg = new PIXI.Container();
        this.main = new PIXI.Container();
        this.gui = new PIXI.Container();
        this.gui2 = new PIXI.Container();
        this.olgui = new PIXI.Container();
        this.fonts = new PIXI.Container();
        this.effects = new PIXI.Container();
        this.cursorlayer = new PIXI.Container();
        this.light = new PIXI.Container();
        this.pool = {POOL_TAG_HEAVEN_SPRITE: []};
        this.main.interactive = false;
        this.gui.interactive = true;
        this.gui2.interactive = true;
        this.olgui.interactive = true;
        this.fonts.interactive = false;

        this.superstage.addChild(this.main);
        this.pixiUiStage = new PIXIUI.Stage(Application.One.SCR_WIDTH, Application.One.SCR_HEIGHT);
        this.superstage.addChild(this.pixiUiStage);
        this.superstage.addChild(this.effects);
        this.main.addChild(this.light);
        this.superstage.addChild(this.olgui);
        
        this.superstage.addChild(this.gui);
        this.superstage.addChild(this.gui2);
        this.superstage.addChild(this.fonts);
        this.superstage.addChild(this.cursorlayer);

        Application.One.app.stage.addChild(this.superstage);
    }

    constructor() {

    }

    createCamera(): Camera {
        this.camera = new Camera([Application.One.SCR_WIDTH / 2, Application.One.SCR_HEIGHT / 2]);
        let inx = this.objects.indexOf(this.camera);
        this.objects.splice(inx, 1);

        return this.camera;
    }

    removeObjects() {
        let len = this.objects.length;

        for (let i = 0; i < len; i++) {
            let obji: O = this.objects[i];
            if (obji.removeable) {
                obji.killNow();
                obji.onDestroy();
                this.objects.splice(i, 1);
                i--;
                len--;
            }
        }

        len = this.static.length;
        for (let i = 0; i < len; i++) {
            let gfx: PIXI.Container = this.static[i];
            gfx.parent.removeChild(gfx);
        }

        this.dynamic = [];
        this.walls = [];
        this.static = [];
    }

    private hideStage(s: Stage, next: Stage) {
        s.onHide(next);
        s.layers = {};
        s.doProcess = false;
    }

    private showStage(s: Stage) {
        s.layers = {};
        s.doProcess = true;
        this.camera.reset(Application.One.SCR_WIDTH / 2, Application.One.SCR_HEIGHT / 2, false);
        s.onShow();
    }

    switchStages(cur: Stage, nw: Stage) {
        if (cur) {
            this.hideStage(cur, nw)
        }

        this.stage = nw;
        this.showStage(this.stage);
    }

    fadeBegin(newStage: any) {
        this.transition = new BlackTransition();
        this.transition.Run(this.stage, newStage);
    }

    openStage(newStage) {
        if (this.inTransit) return;
        newStage.prevStage = this.stage;

        if (this.stage) {
            if (!this.stage.doProcess) return;
            this.stage.doProcess = false;
            this.fadeBegin(newStage);
        } else {
            this.stage = newStage;
            this.stage.doProcess = true;
            newStage.onShow();
        }

    }

    cleanRemoved() {
        let len = this.objects.length;

        for (let i = len - 1; i >= 0; i--) {
            let obji: O = this.objects[i];
            if (obji.doRemove) {
                obji.onDestroy();
                this.objects.splice(i, 1);
                //i--;
            }
        }
    }

    process() {
        Application.One.sm.camera.process();

        this.cleanRemoved();

        let len = this.objects.length;
        for (let i = len - 1; i >= 0; --i) {
            let obji: O = this.objects[i];
                if (obji.compositions && obji.compositions.length > 0)
                obji.processCompositions();
                obji.process();

                if ($DEBUG) {
                    if (obji.context.c != null) {
                        throw "Context chain called without apply";
                    }
            }
        }

        if (this.stage && this.stage.doProcess)
            this.stage.process();
    }

    removeList(objects: O[]): null {
        if (objects) {
            for (let x of objects) {
                if (x != this.camera)
                    x.killNow()
            }
        }

        return null;
    }

    collectObjectsOnLayer(layer: PIXI.Container, list: O[] = null): O[] {
        if (!list) list = this.objects;
        let res: O[] = [];
        for (let x of list) {
            if (x.gfx && x.gfx.parent == layer) {
                res.push(x)
            }
        }

        return res;
    }
}