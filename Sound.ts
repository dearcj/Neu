/**
 * Created by MSI on 04.01.2017.
 */
import {m} from "./Math";

declare var Howl:any;
const SOUND_PATH = 'sound/';
const MUSIC_PATH = 'music/';

type LazyLoadRequest = {
    cb: Function
}

export class Sound {
    constructor() {

    }

    private sounds: Object;
    private _enabled:boolean = true;
    private loaded:number = 0;
    private total:number = 0;
    private musicInstanceName:string;
    private musicInstance:any = null;
    public ready:boolean = false;
    public soundsPlaying: Array<any> = [];
    public loadingCallbacks: Array<any> = [];

    public get enabled() {
        return this._enabled;
    }

    public set enabled(e) {
        this._enabled = e;
    }

    lazyPlayMusic(fullName: string, volume: number = null, pos: number = null): any {
        this.loadOneSound(MUSIC_PATH + fullName, (sound) => {
            this.play(null, sound, true, volume);
        });
    }

    lazyPlaySound(fullName: string): any {
        this.loadOneSound(SOUND_PATH + fullName, (sound) => {
            this.play(null, sound);
        })
    }

    stopAll(){
        for (let x of this.soundsPlaying) {
            x.stop()
        }

        this.loadingCallbacks = [];
    }


    loadOneSound(s: string, cb: Function): void{
        let noExt = s.split("/").pop().replace(/\.[^/.]+$/, "");
        noExt = noExt.toLowerCase();
        let sound = new Howl({
            src: s,
            autoplay: false,
            loop: false,
            volume: 1,
        });

        this.sounds[noExt] = sound;

        this.sounds[noExt].once('load', () => {
            cb(sound);
        });
    }

    load(musicAssets:Array<string>, soundAssets:Array<string>, cb:Function) {
        this.sounds = {};
        let c = 0;
        for (let x of musicAssets) {
            this.loadOneSound(MUSIC_PATH + x, function(){
                c ++;
                if (c == soundAssets.length + musicAssets.length) {
                    cb();
                }
            })
        }

        for (let x of soundAssets) {
            this.loadOneSound(SOUND_PATH + x, function(){
                c ++;
                if (c == soundAssets.length + musicAssets.length) {
                    cb();
                }
            })
        }


        if (c == soundAssets.length + musicAssets.length) {
            cb();
        }

    }


    playMusic(snd:string): any {
        return this.play(snd, null, true);
    }

    unmute() {
        Howl.unmute(false);
    }

    mute() {
        Howl.mute(true);
    }

    playRandom(arr: string[]){
        this.play(m.getRand(arr))
    }

    play(snd: string, sndObj: any = null, loop: boolean =false, volume: number = null): any {
        if (!this.enabled) return;
        try {
            let soundObj = sndObj ? sndObj : this.sounds[snd.toLowerCase()];
            if (volume)
            soundObj.volume(volume);

            soundObj.loop(loop);
            soundObj.play();
            this.soundsPlaying.push(soundObj);

            soundObj.once('end', () => {
                this.soundsPlaying.splice(this.soundsPlaying.indexOf(soundObj) , 1);
            });

            return soundObj;
        } catch (e) {
        }
        return null
    };

}


