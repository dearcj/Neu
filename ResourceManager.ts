import {_} from "../main";
/**
 * Created by MSI on 08.11.2017.
 */

export class ResourceManager  {
    public shaders: Object = {};
    public spineData: Object = {};
    private animFolder: string;
    private spineLoaderListneners: { [key:string]:Function[]; } = {};

    constructor(animFolder: string) {
        this.animFolder = animFolder;
    }

    requestSpine(spineName: string, cb: (spineData: any)=>any) {
            if (this.spineData[spineName]) {
                    return cb(this.spineData[spineName]);
            }

            if (!this.spineLoaderListneners[spineName]) {
                this.spineLoaderListneners[spineName] = [cb]
            } else {
                this.spineLoaderListneners[spineName].push(cb);
                return;
            }

            let loader = new PIXI.loaders.Loader();
            loader
                .add(spineName,  this.animFolder + spineName +'.json',)
                .load((loader, resources) => {
                    this.spineData[spineName] = resources[spineName].spineData;
                        for (let x in this.spineLoaderListneners[spineName]) {
                            this.spineLoaderListneners[spineName][x](this.spineData[spineName]);
                        }
                        this.spineLoaderListneners[spineName] = null;
                });
    }

    loadAssets(assets: string[], onProcess: (loader: any, evt: any) => any, onComplete: () => any) {
        let loader = new PIXI.loaders.Loader();
        loader.add(assets);


        loader.on('complete', () => {
            onComplete();
        });
        loader.on('progress', (loader: any, evt:  any) => {
            if (evt.name.indexOf('shaders') >= 0) {
                let result = evt.name.substring(evt.name.lastIndexOf("/") + 1);
                this.shaders[result] = evt.data
            }

            if (evt.name.indexOf('/') > 0 && evt.type == PIXI.loaders.Resource.TYPE.XML) {
                let ext = evt.name.substr(evt.name.lastIndexOf('.') + 1);
                let result = evt.name.substring(evt.name.lastIndexOf("/") + 1);
                result = result.substring(0, result.length - 4);

                if (ext == 'tsx') {
                    _.lm.addTileset(result, evt.data);
                }

                if (ext == 'tmx') {
                    _.lm.add(result, evt.data);
                }

            }

            onProcess(loader, evt)
        });
        loader.load();
    }
}