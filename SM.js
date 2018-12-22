define(["require", "exports", "./BaseObjects/Camera", "./Math", "./Application", "./Transitions/BlackTransition", "../main"], function (require, exports, Camera_1, Math_1, Application_1, BlackTransition_1, main_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.POOL_TAG_SPRITE = "sprite";
    exports.POOL_TAG_HEAVEN_SPRITE = "heaven_sprite";
    exports.POOL_TAG_CONTAINER = "container";
    exports.POOL_TAG_GRAPHICS = "graphics";
    var SM = /** @class */ (function () {
        function SM() {
            this.pool = {};
            this.stage = null;
            this.prevStage = null;
            this.inTransit = false;
            this.loading = false;
            this.objects = [];
            this.static = [];
            this.walls = [];
            this.dynamic = [];
            this.globalIds = {};
        }
        SM.prototype.resetObj = function (obj) {
            obj.visible = true;
            obj.alpha = 1;
            obj.blendMode = PIXI.BLEND_MODES.NORMAL;
            obj._activeParentLayer = null;
            obj.cacheAsBitmap = false;
            obj.interactive = false;
            obj.interactiveChildren = false;
            obj.x = 0;
            obj.y = 0;
            obj.width = 0;
            obj.height = 0;
            obj.rotation = 0;
            if (obj instanceof PIXI.DisplayObject) {
                obj.buttonMode = false;
                obj.hitArea = null;
                obj.setTransform(0, 0, 1, 1, 0, 0, 0, 0, 0);
            }
            if (obj instanceof PIXI.Graphics) {
                obj.tint = 0xffffff;
                obj.clear();
            }
            if (obj instanceof PIXI.heaven.Sprite) {
                obj.anchor.x = 0;
                obj.anchor.y = 0;
                obj.skew.set();
                obj.filters = [];
                obj.filterArea = null;
                obj.color.clear();
                obj.maskSprite = null;
                obj.maskVertexData = null;
                obj.mask = null;
                obj.renderable = true;
            }
            if (obj instanceof PIXI.Sprite) {
                obj.anchor.x = 0;
                obj.anchor.y = 0;
                obj.renderable = true;
                obj.skew.set();
                obj.filters = [];
                obj.filterArea = null;
                obj.tint = 0xffffff;
                obj.mask = null;
            }
            obj.displayOrder = 0;
        };
        SM.prototype.toPool = function (obj) {
            var tagname;
            var constructor = Object.getPrototypeOf(obj).constructor;
            if (constructor == PIXI.Container) {
                //    tagname = POOL_TAG_CONTAINER;
            }
            if (constructor == PIXI.Graphics) {
                //    tagname = POOL_TAG_GRAPHICS;
            }
            if (constructor == PIXI.Sprite) {
                //    tagname = POOL_TAG_SPRITE;
            }
            if (constructor == PIXI.heaven.Sprite) {
                tagname = exports.POOL_TAG_HEAVEN_SPRITE;
            }
            obj.inPool = true;
            if (!this.pool[tagname]) {
                this.pool[tagname] = [];
            }
            this.pool[tagname].push(obj);
        };
        SM.prototype.fromPool = function (tag) {
            if (!this.pool[tag]) {
                return null;
            }
            else {
                var p = this.pool[tag].shift();
                if (p) {
                    p.inPool = null;
                    this.resetObj(p);
                }
                return p;
            }
        };
        SM.prototype.ZOrderContainer = function (c) {
            c.children.sort(function (a, b) {
                return a.position.y - b.position.y;
            });
        };
        SM.prototype.ZUpdate = function (container, c) {
            var l = Math_1.binarySearch(container.children, c, function (a, b) {
                return a.position.y - b.position.y;
            });
            if (l < 0) { // if the binarySearch return value was zero or positive, a matching object was found
                l = ~l;
            }
            container.setChildIndex(c, Math.min(l + 1, container.children.length - 1));
        };
        SM.prototype.addStatic = function (gfx) {
            this.static.push(gfx);
        };
        SM.prototype.findByProp = function (prop, list) {
            if (list === void 0) { list = null; }
            if (!list)
                list = this.objects;
            var res = [];
            for (var _i = 0, list_1 = list; _i < list_1.length; _i++) {
                var o = list_1[_i];
                if (!o.doRemove && o.properties[prop])
                    res.push(o);
            }
            return res;
        };
        SM.prototype.findMultiple = function (stringId, list) {
            if (list === void 0) { list = null; }
            if (!list)
                list = this.objects;
            var res = [];
            for (var _i = 0, list_2 = list; _i < list_2.length; _i++) {
                var o = list_2[_i];
                if (!o.doRemove && o.stringID == stringId)
                    res.push(o);
            }
            return res;
        };
        SM.prototype.findOne = function (stringId, list) {
            if (list === void 0) { list = null; }
            if (Application_1.Application.One.sm.globalIds[stringId]) {
                return Application_1.Application.One.sm.globalIds[stringId];
            }
            if (!list)
                list = this.objects;
            for (var _i = 0, list_3 = list; _i < list_3.length; _i++) {
                var o = list_3[_i];
                if (!o.doRemove && o.stringID == stringId)
                    return o;
            }
        };
        SM.prototype.findByTypeOne = function (constructor, list) {
            if (list === void 0) { list = null; }
            if (!list)
                list = this.objects;
            for (var _i = 0, list_4 = list; _i < list_4.length; _i++) {
                var o = list_4[_i];
                if (!o.doRemove && o instanceof constructor) {
                    return o;
                }
            }
            return null;
        };
        SM.prototype.findByType = function (constructor, list) {
            if (list === void 0) { list = null; }
            if (!list)
                list = this.objects;
            var res = [];
            for (var _i = 0, list_5 = list; _i < list_5.length; _i++) {
                var o = list_5[_i];
                if (!o.doRemove && o instanceof constructor) {
                    res.push(o);
                }
            }
            return res;
        };
        SM.prototype.init = function () {
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
            this.pool = { POOL_TAG_HEAVEN_SPRITE: [] };
            this.main.interactive = false;
            this.gui.interactive = true;
            this.gui2.interactive = true;
            this.olgui.interactive = true;
            this.fonts.interactive = false;
            this.superstage.addChild(this.main);
            this.pixiUiStage = new main_1.PIXIUI.Stage(Application_1.Application.One.SCR_WIDTH, Application_1.Application.One.SCR_HEIGHT);
            this.superstage.addChild(this.pixiUiStage);
            this.superstage.addChild(this.effects);
            this.main.addChild(this.light);
            this.superstage.addChild(this.olgui);
            this.superstage.addChild(this.gui);
            this.superstage.addChild(this.gui2);
            this.superstage.addChild(this.fonts);
            this.superstage.addChild(this.cursorlayer);
            Application_1.Application.One.app.stage.addChild(this.superstage);
        };
        SM.prototype.createCamera = function () {
            this.camera = new Camera_1.Camera([Application_1.Application.One.SCR_WIDTH / 2, Application_1.Application.One.SCR_HEIGHT / 2]);
            var inx = this.objects.indexOf(this.camera);
            this.objects.splice(inx, 1);
            return this.camera;
        };
        SM.prototype.removeObjects = function () {
            var len = this.objects.length;
            for (var i = 0; i < len; i++) {
                var obji = this.objects[i];
                if (obji.removeable) {
                    obji.killNow();
                    obji.onDestroy();
                    this.objects.splice(i, 1);
                    i--;
                    len--;
                }
            }
            len = this.static.length;
            for (var i = 0; i < len; i++) {
                var gfx = this.static[i];
                gfx.parent.removeChild(gfx);
            }
            this.dynamic = [];
            this.walls = [];
            this.static = [];
        };
        SM.prototype.hideStage = function (s, next) {
            s.onHide(next);
            s.layers = {};
            s.doProcess = false;
        };
        SM.prototype.showStage = function (s) {
            s.layers = {};
            s.doProcess = true;
            this.camera.reset(Application_1.Application.One.SCR_WIDTH / 2, Application_1.Application.One.SCR_HEIGHT / 2, false);
            s.onShow();
        };
        SM.prototype.switchStages = function (cur, nw) {
            if (cur) {
                this.hideStage(cur, nw);
            }
            this.stage = nw;
            this.showStage(this.stage);
        };
        SM.prototype.fadeBegin = function (newStage) {
            this.transition = new BlackTransition_1.BlackTransition();
            this.transition.Run(this.stage, newStage);
        };
        SM.prototype.openStage = function (newStage) {
            if (this.inTransit)
                return;
            newStage.prevStage = this.stage;
            if (this.stage) {
                if (!this.stage.doProcess)
                    return;
                this.stage.doProcess = false;
                this.fadeBegin(newStage);
            }
            else {
                this.stage = newStage;
                this.stage.doProcess = true;
                newStage.onShow();
            }
        };
        SM.prototype.cleanRemoved = function () {
            var len = this.objects.length;
            for (var i = len - 1; i >= 0; i--) {
                var obji = this.objects[i];
                if (obji.doRemove) {
                    obji.onDestroy();
                    this.objects.splice(i, 1);
                    i--;
                }
            }
        };
        SM.prototype.process = function () {
            Application_1.Application.One.sm.camera.process();
            this.cleanRemoved();
            var len = this.objects.length;
            for (var i = len - 1; i >= 0; --i) {
                var obji = this.objects[i];
                if (obji.compositions && obji.compositions.length > 0)
                    obji.processCompositions();
                obji.process();
                if (Application_1.$DEBUG) {
                    if (obji.context.c != null) {
                        throw "Context chain called without apply";
                    }
                }
            }
            if (this.stage && this.stage.doProcess)
                this.stage.process();
        };
        SM.prototype.removeList = function (objects) {
            if (objects) {
                for (var _i = 0, objects_1 = objects; _i < objects_1.length; _i++) {
                    var x = objects_1[_i];
                    if (x != this.camera)
                        x.killNow();
                }
            }
            return null;
        };
        SM.prototype.collectObjectsOnLayer = function (layer, list) {
            if (list === void 0) { list = null; }
            if (!list)
                list = this.objects;
            var res = [];
            for (var _i = 0, list_6 = list; _i < list_6.length; _i++) {
                var x = list_6[_i];
                if (x.gfx && x.gfx.parent == layer) {
                    res.push(x);
                }
            }
            return res;
        };
        return SM;
    }());
    exports.SM = SM;
});
