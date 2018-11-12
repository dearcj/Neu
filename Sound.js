define(["require", "exports", "./Math"], function (require, exports, Math_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SOUND_PATH = 'sound/';
    var MUSIC_PATH = 'music/';
    var Sound = /** @class */ (function () {
        function Sound() {
            this._enabled = true;
            this.loaded = 0;
            this.total = 0;
            this.musicInstance = null;
            this.ready = false;
            this.soundsPlaying = [];
            this.loadingCallbacks = [];
        }
        Object.defineProperty(Sound.prototype, "enabled", {
            get: function () {
                return this._enabled;
            },
            set: function (e) {
                this._enabled = e;
            },
            enumerable: true,
            configurable: true
        });
        Sound.prototype.lazyPlayMusic = function (fullName, volume, pos) {
            var _this = this;
            if (volume === void 0) { volume = null; }
            if (pos === void 0) { pos = null; }
            var o = { cb: null };
            var cb = function (sound) {
                var found = false;
                var inx = -1;
                for (var i = 0; i < _this.loadingCallbacks.length; ++i) {
                    if (_this.loadingCallbacks[i] == o) {
                        inx = i;
                        found = true;
                        break;
                    }
                }
                if (!found)
                    return;
                _this.loadingCallbacks.splice(inx, 1);
                if (pos)
                    sound.seek(pos);
                if (volume)
                    sound.volume(volume);
                _this.play(null, sound);
            };
            o.cb = cb;
            this.loadingCallbacks.push(o);
            this.loadOneSound(MUSIC_PATH + fullName, cb);
        };
        Sound.prototype.lazyPlaySound = function (fullName) {
            var _this = this;
            this.loadOneSound(SOUND_PATH + fullName, function (sound) {
                _this.play(null, sound);
            });
        };
        Sound.prototype.stopAll = function () {
            for (var _i = 0, _a = this.soundsPlaying; _i < _a.length; _i++) {
                var x = _a[_i];
                x.stop();
            }
            this.loadingCallbacks = [];
        };
        Sound.prototype.loadOneSound = function (s, cb) {
            var noExt = s.split("/").pop().replace(/\.[^/.]+$/, "");
            noExt = noExt.toLowerCase();
            var sound = new Howl({
                src: s,
                autoplay: false,
                loop: false,
                volume: 1,
            });
            this.sounds[noExt] = sound;
            this.sounds[noExt].once('load', function () {
                cb(sound);
            });
        };
        Sound.prototype.load = function (musicAssets, soundAssets, cb) {
            this.sounds = {};
            var c = 0;
            for (var _i = 0, musicAssets_1 = musicAssets; _i < musicAssets_1.length; _i++) {
                var x = musicAssets_1[_i];
                this.loadOneSound(MUSIC_PATH + x, function () {
                    c++;
                    if (c == soundAssets.length + musicAssets.length) {
                        cb();
                    }
                });
            }
            for (var _a = 0, soundAssets_1 = soundAssets; _a < soundAssets_1.length; _a++) {
                var x = soundAssets_1[_a];
                this.loadOneSound(SOUND_PATH + x, function () {
                    c++;
                    if (c == soundAssets.length + musicAssets.length) {
                        cb();
                    }
                });
            }
            if (c == soundAssets.length + musicAssets.length) {
                cb();
            }
        };
        Sound.prototype.playMusic = function (snd) {
        };
        Sound.prototype.unmute = function () {
        };
        Sound.prototype.mute = function () {
        };
        Sound.prototype.playRandom = function (arr) {
            this.play(Math_1.m.getRand(arr));
        };
        Sound.prototype.play = function (snd, sndObj) {
            var _this = this;
            if (sndObj === void 0) { sndObj = null; }
            if (!this.enabled)
                return;
            snd = snd.toLowerCase();
            try {
                var soundObj_1 = sndObj ? sndObj : this.sounds[snd];
                soundObj_1.play();
                this.soundsPlaying.push(soundObj_1);
                soundObj_1.on('end', function () {
                    _this.soundsPlaying.splice(_this.soundsPlaying.indexOf(soundObj_1), 1);
                });
            }
            catch (e) {
            }
        };
        ;
        return Sound;
    }());
    exports.Sound = Sound;
});
