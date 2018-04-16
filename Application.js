define(["require", "exports", "./PIXIPlugins/AnimClip", "./SM", "./Loader", "../ClientSettings", "./Controls", "../main", "./PauseTimer"], function (require, exports, AnimClip_1, SM_1, Loader_1, ClientSettings_1, Controls_1, main_1, PauseTimer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TweenMax = window.TweenMax;
    exports.TweenLite = window.TweenLite;
    exports.PIXI = window.PIXI;
    exports.CustomEase = window.CustomEase;
    exports.Bounce = window.Bounce;
    exports.Linear = window.Linear;
    exports.Quad = window.Quad;
    exports.Power3 = window.Power3;
    exports.Power2 = window.Power2;
    exports.Sine = window.Sine;
    exports.Elastic = window.Elastic;
    exports.TimelineMax = window.TimelineMax;
    var Application = /** @class */ (function () {
        function Application(MIN_SCR_WIDTH, MIN_SCR_HEIGHT) {
            this.fMath = new main_1.FMath(null);
            this.timer = new PauseTimer_1.PauseTimer();
            this.appScale = 1;
            this.activeTab = true;
            this.lastLoop = 0;
            this.worldSpeed = 1;
            this.debug = true;
            this.delta = 0;
            this.deltaSec = 0.01;
            this.totalFrames = 0;
            this.totalDelta = 0;
            this.timeScale = 1;
            this.isInitialLoading = true;
            this.MIN_SCR_HEIGHT = MIN_SCR_HEIGHT;
            this.MIN_SCR_WIDTH = MIN_SCR_WIDTH;
            Application.One = this;
        }
        Application.prototype.start = function () {
            var _this = this;
            document.addEventListener('contextmenu', function (event) {
                if (_this.onContext)
                    _this.onContext();
                event.preventDefault();
            });
            document.addEventListener('visibilitychange', function () {
                var TRICKYTIMECOEF = 0.75;
                if (main_1._.sm.stage == main_1._.game) {
                    var SpeedUpCoef = 50;
                    if (document.hidden) {
                        main_1._.lostFocusAt = new Date().getTime();
                    }
                    else {
                        var lag = new Date().getTime() - main_1._.lostFocusAt;
                        main_1._.setTimeScale(SpeedUpCoef);
                        main_1._.game.enableInput(false);
                        setTimeout(function () {
                            main_1._.game.enableInput(true);
                            main_1._.setTimeScale(1);
                        }, (lag / SpeedUpCoef) * TRICKYTIMECOEF);
                    }
                    _this.activeTab = !document.hidden;
                }
            });
            this.controls = new Controls_1.Controls();
            this.PIXI = exports.PIXI;
            this.app = new exports.PIXI.Application(this.SCR_WIDTH, this.SCR_HEIGHT, {
                autoStart: false,
                clearBeforeRender: false,
                resolution: this.appScale, antialias: false,
                preserveDrawingBuffer: false, forceFXAA: true, backgroundColor: 0xfffffff,
            });
            document.body.appendChild(this.app.view);
            this.camera = new exports.PIXI.Container();
            this.camera.x = 0;
            this.camera.y = 0;
            this.app.stage = new exports.PIXI.Container();
            this.statsPIXIHook = new GStats.PIXIHooks(this.app);
            this.stats = new GStats.StatsJSAdapter(this.statsPIXIHook);
            document.body.appendChild(this.stats.stats.dom || this.stats.stats.domElement);
            this.stats.stats.domElement.style.position = "absolute";
            this.stats.stats.domElement.style.top = "0px";
            this.sm = new SM_1.SM();
            this.sm.init();
            this.lm = new Loader_1.Loader();
            this.sm.createCamera();
            this.lastLoop = (new Date()).getTime();
            this.lastNetworkPing = this.lastLoop;
            var bindedProcess = this.process.bind(this);
            exports.TweenMax.ticker.addEventListener("tick", bindedProcess);
            var bindedAnimate = this.animate.bind(this);
            this.app.ticker.add(bindedAnimate);
            this.app.ticker.start();
        };
        Application.prototype.killTween = function (tween) {
            if (tween && tween.totalProgress() != 1)
                tween.totalProgress(1).kill();
            return null;
        };
        Application.prototype.addFilter = function (m, x) {
            var mm = (m);
            if (!mm._filters)
                mm._filters = [];
            mm._filters.push(x);
        };
        Application.prototype.removeFilterByType = function (main, ftype) {
            var m = main;
            if (!m._filters)
                return;
            for (var x = m._filters.length - 1; x >= 0; x--) {
                if (m._filters[x] instanceof ftype) {
                    m._filters.splice(x, 1);
                }
            }
        };
        Application.prototype.removeFilter = function (main, f) {
            var m = main;
            m._filters.splice(main_1._.sm.main.filters.indexOf(f), 1);
        };
        Application.prototype.setTimeScale = function (x) {
            exports.TweenMax.globalTimeScale(x);
            this.timeScale = x;
        };
        Application.prototype.animate = function () {
            this.timer.process();
            this.random = Math.random();
            this.time = (new Date()).getTime();
            this.cursorPos = this.app.renderer.plugins.interaction.mouse.global;
            if (this.stats)
                this.stats.update();
        };
        Application.prototype.process = function () {
            this.controls.update();
            if (!this.isInitialLoading) {
                var timeD = (this.time - this.lastLoop);
                this.lastLoop = this.time;
                this.deltaSec = timeD / 1000.;
                this.delta = timeD / ClientSettings_1.FRAME_DELAY;
                this.totalDelta += this.delta;
                this.totalFrames++;
                this.sm.process();
            }
        };
        Application.prototype.setScreenRes = function (baseW, baseH) {
            this.appScale = baseH / ClientSettings_1.MIN_SCR_HEIGHT;
            if (this.appScale > 1.28)
                this.appScale = 1.28;
            this.SCR_WIDTH = baseW / this.appScale;
            this.SCR_HEIGHT = baseH / this.appScale;
            this.SCR_WIDTH_HALF = this.SCR_WIDTH * .5;
            this.SCR_HEIGHT_HALF = this.SCR_HEIGHT * .5;
            this.screenCenterOffset = [(this.SCR_WIDTH - ClientSettings_1.MIN_SCR_WIDTH) * .5, (this.SCR_HEIGHT - ClientSettings_1.MIN_SCR_HEIGHT) * .5];
        };
        Application.prototype.cm = function (s, layer, autoplay, times) {
            if (layer === void 0) { layer = null; }
            if (autoplay === void 0) { autoplay = false; }
            if (times === void 0) { times = null; }
            var textures = [];
            var keys = [];
            for (var key in exports.PIXI.utils.TextureCache) {
                if (key.indexOf(s) == 0) {
                    keys.push(key);
                }
            }
            var inx = 0;
            for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                var key = keys_1[_i];
                if (times) {
                    textures.push({ texture: exports.PIXI.utils.TextureCache[key], time: times[inx] ? times[inx] : 1 });
                }
                else {
                    textures.push(exports.PIXI.utils.TextureCache[key]);
                }
                inx++;
            }
            var gfx = new AnimClip_1.AnimClip(textures);
            gfx.anchor.x = 0.5;
            gfx.anchor.y = 0.5;
            if (layer)
                layer.addChild(gfx);
            if (autoplay) {
                gfx.gotoAndPlay(0);
            }
            return gfx;
        };
        Application.prototype.csproj = function (s, layer) {
            if (layer === void 0) { layer = null; }
            var texture = exports.PIXI.Texture.fromFrame(s);
            var gfx = new exports.PIXI.projection.Sprite(texture);
            gfx.anchor.x = .5;
            gfx.anchor.y = .5;
            if (layer)
                layer.addChild(gfx);
            else {
            }
            return gfx;
        };
        Application.prototype.cp = function (layer) {
            if (layer === void 0) { layer = null; }
            var p = new exports.PIXI.Container();
            layer.addChild(p);
            return p;
        };
        Application.prototype.cs = function (s, layer) {
            if (layer === void 0) { layer = null; }
            if (!exports.PIXI.utils.TextureCache[s]) {
                console.log("@@@@Can't find ", s);
                return null;
            }
            var texture = exports.PIXI.Texture.fromFrame(s);
            texture = texture ? texture : exports.PIXI.Texture.fromFrame(s + '.png');
            if (texture) {
                var gfx = new exports.PIXI.heaven.Sprite(texture);
                gfx.anchor.x = .5;
                gfx.anchor.y = .5;
                if (layer)
                    layer.addChild(gfx);
                else {
                }
                return gfx;
            }
            else {
                console.log("@@@@Can't find ", s);
                return null;
            }
        };
        Application.prototype._ = function (s) {
            return this.sm.findOne(s);
        };
        return Application;
    }());
    exports.Application = Application;
});
