define(["require", "exports", "../main"], function (require, exports, main_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Created by MSI on 08.11.2017.
     */
    var ResourceManager = /** @class */ (function () {
        function ResourceManager(animFolder) {
            this.shaders = {};
            this.spineData = {};
            this.spineLoaderListneners = {};
            this.animFolder = animFolder;
        }
        ResourceManager.prototype.requestSpine = function (spineName, cb) {
            var _this = this;
            if (this.spineData[spineName]) {
                return cb(this.spineData[spineName]);
            }
            if (!this.spineLoaderListneners[spineName]) {
                this.spineLoaderListneners[spineName] = [cb];
            }
            else {
                this.spineLoaderListneners[spineName].push(cb);
                return;
            }
            var loader = new PIXI.loaders.Loader();
            loader
                .add(spineName, this.animFolder + spineName + '.json')
                .load(function (loader, resources) {
                _this.spineData[spineName] = resources[spineName].spineData;
                for (var x in _this.spineLoaderListneners[spineName]) {
                    _this.spineLoaderListneners[spineName][x](_this.spineData[spineName]);
                }
                _this.spineLoaderListneners[spineName] = null;
            });
        };
        ResourceManager.prototype.loadAssets = function (assets, onProcess, onComplete) {
            var _this = this;
            var loader = new PIXI.loaders.Loader();
            if (PIXI.compressedTextures) {
                loader.before(PIXI.compressedTextures.imageParser());
            }
            loader.add(assets);
            loader.on('complete', function () {
                onComplete();
            });
            loader.on('progress', function (loader, evt) {
                if (evt.name.indexOf('shaders') >= 0) {
                    var result = evt.name.substring(evt.name.lastIndexOf("/") + 1);
                    _this.shaders[result] = evt.data;
                }
                if (evt.name.indexOf('/') > 0 && evt.type == PIXI.loaders.Resource.TYPE.XML) {
                    var ext = evt.name.substr(evt.name.lastIndexOf('.') + 1);
                    var result = evt.name.substring(evt.name.lastIndexOf("/") + 1);
                    result = result.substring(0, result.length - 4);
                    if (ext == 'tsx') {
                        main_1._.lm.addTileset(result, evt.data);
                    }
                    if (ext == 'tmx') {
                        main_1._.lm.add(result, evt.data);
                    }
                }
                onProcess(loader, evt);
            });
            loader.load();
        };
        return ResourceManager;
    }());
    exports.ResourceManager = ResourceManager;
});
