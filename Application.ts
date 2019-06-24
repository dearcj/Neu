import {AnimClip} from "./PIXIPlugins/AnimClip";
import {O} from "./BaseObjects/O";
import {POOL_TAG_ANIM_CLIP, POOL_TAG_GRAPHICS, POOL_TAG_HEAVEN_SPRITE, POOL_TAG_SPRITE, SM} from "./SM";
import {ResourceManager} from "./ResourceManager";
import {Loader} from "./Loader";
import {Vec2} from "./Math";
import {FRAME_DELAY} from "../ClientSettings";
import {Controls} from "./Controls";
import {PauseTimer} from "./PauseTimer";
import {Sound} from "./Sound";
import {Engine} from "../lib/matter";

declare let window: any;
export let TweenMax = window.TweenLite;
export let TimelineMax = window.TimelineMax;
export let TweenLite = window.TweenLite;
export let PIXI = window.PIXI;
export let CustomEase = window.CustomEase;
export let Bounce = window.Bounce;
export let Linear = window.Linear;
export let Quad = window.Quad;
export let Power1 = window.Power1;
export let Power4 = window.Power4;
export let Power3 = window.Power3;
export let Power2 = window.Power2;
export let Sine = window.Sine;
export let Elastic = window.Elastic;
export let Expo = window.Expo;
export let SteppedEase = window.SteppedEase;
export let SlowMo = window.SlowMo;
export let Circ = window.Circ;
export let FMath = (<any>window).FMath;
export let $DEBUG = true;

export class Application {
    public fMath: any = new FMath(null);
    public engine: any;

    static One: Application;

    public timer: PauseTimer = new PauseTimer();
    public time: number;
    public rm: ResourceManager;
    public sm: SM;
    public lm: Loader;
    public app: PIXI.Application;
    public screenCenterOffset: Vec2;
    public SCR_WIDTH: number;
    public SCR_HEIGHT: number;
    public appScale = 1;
    public activeTab: boolean = true;
    public onContext: Function;

    public SCR_WIDTH_HALF: number;
    public SCR_HEIGHT_HALF: number;
    public MIN_SCR_HEIGHT: number;
    public MIN_SCR_WIDTH: number;

    private lastLoop: number = 0;
    private country: string;
    private avgFPS: number;
    private avgPing: number;
    public lastNetworkPing: number;

    public controls: Controls;
    public PIXI: any;
    public renderer: any;
    public worldSpeed: number = 1;
    public debug: boolean = true;

    public delta: number = 0;
    public deltaSec: number = 0.01;
    public totalFrames: number = 0;
    public totalDelta: number = 0;
    private statsPIXIHook: any;
    public stats: any;
    public timeScale: number = 1;
    public sound: Sound;
    private random: number;
    public cursorPos: PIXI.Point;
    public globalMouseDown: Function;
    protected isInitialLoading: boolean = true;
    public resolution: number = window.devicePixelRatio;
    protected addStats: boolean = true;

    start() {
        this.engine = Engine.create();

        document.addEventListener('contextmenu', (event) => {
            if (this.onContext) this.onContext();
            event.preventDefault()
        });

        this.controls = new Controls();
        this.PIXI = PIXI;

        this.app = new PIXI.Application(this.SCR_WIDTH, this.SCR_HEIGHT, {
            autoStart: false,
            clearBeforeRender: false,
            resolution: this.resolution, antialias: true,
            preserveDrawingBuffer: false, forceFXAA: false, backgroundColor: 0x111111,
        });

        this.app.renderer = new PIXI.WebGLRenderer({
            width: this.SCR_WIDTH, height: this.SCR_HEIGHT,
            resolution: this.resolution,
            autoStart: false,
        });

        document.body.appendChild(this.app.view);
        this.app.stage = new PIXI.display.Stage();

        if (this.addStats) {
            this.statsPIXIHook = new window.GStats.PIXIHooks(this.app);
            this.stats = new window.GStats.StatsJSAdapter(this.statsPIXIHook);
            document.body.appendChild(this.stats.stats.dom || this.stats.stats.domElement);
            this.stats.stats.domElement.style.position = "absolute";
            this.stats.stats.domElement.style.top = "0px";
        }

        this.sm = new SM();
        this.sm.init();
        this.lm = new Loader();
        this.sm.createCamera();
        this.lastLoop = (new Date()).getTime();
        this.lastNetworkPing = this.lastLoop;
        PIXI.ticker.shared.stop();


        let bindedProcess = this.process.bind(this);
        TweenMax.ticker.addEventListener("tick", ()=>{
            this.sm.cameraProcess();
            this.app.renderer.render(this.app.stage);
            this.process();
        });

//        this.app.ticker.add(bindedProcess, this, PIXI.UPDATE_PRIORITY.LOW);
    /*    this.app.ticker.add(()=>{
            this.app.renderer.render(this.app.stage);
            this.sm.cameraProcess();
            this.process();
        }, this, PIXI.UPDATE_PRIORITY.HIGH);
        this.app.ticker.start();*/
    }

    killTweensOf(obj: any): null {
        let tweens = TweenMax.getTweensOf(obj);
        for (let t of tweens) {
            if (t.totalProgress() != 1)
                t.totalProgress(1).kill();
        }

        return null
    }

    killTweens(...tweens: any[]): null {
        for (let tween of tweens) {
            if (tween && tween.totalProgress() != 1)
                tween.totalProgress(1).kill();
        }
        return null
    }

    addFilter(m: PIXI.Container, x: PIXI.Filter<any>) {
        let mm: any = <any>(m);
        if (!mm._filters) mm._filters = [];
        mm._filters.push(x);
    }

    removeFilterByType(main: PIXI.Container, ftype: any) {
        let m = <any>main;
        if (!m._filters) return;
        for (let x = m._filters.length - 1; x >= 0; x--) {
            if (m._filters[x] instanceof ftype) {
                m._filters.splice(x, 1);
            }
        }
    }

    removeFilter(main: PIXI.Container, f: PIXI.Filter<any>) {
        let m = <any>main;
        let inx = this.sm.main.filters.indexOf(f);
        if (~inx)
            m._filters.splice(inx, 1);
    }

    setTimeScale(x: number) {
        TweenMax.globalTimeScale(x);
        this.timeScale = x;
    }

    animate(): void {
        this.controls.update();

        if (this.addStats)
            this.stats.update();

        this.timer.process();
        this.random = Math.random();
        this.time = (new Date()).getTime();
        this.cursorPos = this.app.renderer.plugins.interaction.mouse.global;
    }

    process() {
        this.animate();

        if (!this.isInitialLoading) {
            let timeD = (this.time - this.lastLoop);
            this.lastLoop = this.time;
            this.deltaSec = timeD / 1000.;
            this.delta = timeD / FRAME_DELAY;
            this.totalDelta += this.delta;
            this.totalFrames++;
            this.sm.process();
        }
    }

    constructor(MIN_SCR_WIDTH, MIN_SCR_HEIGHT: number) {
        this.MIN_SCR_HEIGHT = MIN_SCR_HEIGHT;
        this.MIN_SCR_WIDTH = MIN_SCR_WIDTH;
        Application.One = this;
    }

    free(o: PIXI.Sprite | PIXI.heaven.Sprite | PIXI.Graphics | PIXI.Container | PIXI.DisplayObject): null {
        if (!o) return;

        this.rp(o);

        if ((<any>o).inPool) {
            return
        }

        let tagname = this.sm.poolTag(o);

        if (tagname) {
            if ((<any>o).children) {
                while ((<any>o).children.length > 0) {
                    this.free((<any>o).children[(<any>o).children.length - 1]);
                }
            }

            this.sm.toPool(o, tagname);
        }

        return null;
    }

    public rp(c: any): null {
        if (c && c.parent) {
            let pp = c.parent;
            c.parent.removeChild(c);
        }

        return null;
    }

    public cm(s: string, layer: PIXI.Container = null, autoplay: boolean = false, times: number[] = null): AnimClip { //create sprite from frame and add to default layer
        let textures = [];
        let keys: Array<string> = [];
        for (let key in PIXI.utils.TextureCache) {
            if (key.indexOf(s) == 0) {
                keys.push(key);
            }
        }

        let inx = 0;
        for (let key of keys) {
            if (times) {
                textures.push({texture: PIXI.utils.TextureCache[key], time: times[inx] ? times[inx] : 1});
            } else {
                textures.push(PIXI.utils.TextureCache[key]);
            }
            inx++;
        }

        let gfx = null;//this.sm.fromPool(POOL_TAG_ANIM_CLIP);
        if (!gfx)
            gfx = new AnimClip(textures); else {
            gfx.textures = textures;
            gfx.endFrame = textures.length - 1;
        }

        gfx.anchor.x = 0.5;
        gfx.anchor.y = 0.5;

        if (layer)
            layer.addChild(gfx);

        if (autoplay) {
            gfx.gotoAndPlay(0)
        }

        return gfx;
    }

    public csproj(s: string, layer: PIXI.Container = null): any {
        let texture = PIXI.Texture.fromFrame(s);
        let gfx = new PIXI.projection.Sprite(texture);
        gfx.anchor.x = .5;
        gfx.anchor.y = .5;
        if (layer)
            layer.addChild(gfx); else {
        }

        return gfx
    }

    public cc(layer: PIXI.Container = null): PIXI.Container {
        let p = this.sm.fromPool(POOL_TAG_SPRITE);
        if (!p) p = new PIXI.Container(); else {
            console.log("Container from pool")
        }

        if (layer)
            layer.addChild(p);
        return p;
    }

    public cg(layer: PIXI.Container = null): PIXI.Graphics {
        let p = this.sm.fromPool(POOL_TAG_GRAPHICS);
        if (!p) p = new PIXI.Graphics(); else {
            console.log("Graphics from pool")
        }
        if (layer)
            layer.addChild(p);

        return p;
    }


    public cs<T extends PIXI.Sprite>(s: string, layer: PIXI.Container = null, tex: PIXI.Texture = null, centered: boolean = true): PIXI.heaven.Sprite { //create sprite from frame and add to default layer
        let texture = tex;
        if (!texture && s != "") {
            if (PIXI.utils.TextureCache[s]) {
                texture = PIXI.Texture.fromFrame(s);
            } else {
                texture = PIXI.Texture.fromFrame(s + '.png');
            }
        }

        if (texture || s == "") {
            let gfx = this.sm.fromPool(POOL_TAG_HEAVEN_SPRITE);

            if (!gfx) gfx = new PIXI.heaven.Sprite(texture); else {
                (<PIXI.heaven.Sprite>gfx).texture = texture;
                (<PIXI.heaven.Sprite>gfx)._onTextureUpdate();
            }

            if (centered) {
                gfx.anchor.x = .5;
                gfx.anchor.y = .5;
            }

            if (layer)
                layer.addChild(gfx);

            return gfx;
        } else {
            console.log("Can't find ", s);
            return null;
        }

    }

    public csStd(s: string, layer: PIXI.Container = null): PIXI.Sprite { //create sprite from frame and add to default layer
        let texture;
        if (PIXI.utils.TextureCache[s]) {
            texture = PIXI.Texture.fromFrame(s);
        } else {
            texture = PIXI.Texture.fromFrame(s + '.png');
        }

        if (!texture) {
            console.log("Can't find ", s);
            return null;
        }
        if (texture) {
            let gfx = new PIXI.Sprite(texture);
            gfx.anchor.x = .5;
            gfx.anchor.y = .5;
            if (layer)
                layer.addChild(gfx); else {
            }
            return gfx
        } else {
            console.log("Can't find ", s);
            return null;
        }

    }

    public _(s: string): O {
        return this.sm.findOne(s)
    }
}