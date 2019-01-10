import Texture = PIXI.Texture;
import AnimatedSpriteTextureTimeObject = PIXI.extras.AnimatedSpriteTextureTimeObject;
/**
 * Created by MSI on 18.10.2017.
 */


export class AnimClip extends PIXI.extras.AnimatedSprite {
    public endFrame: number = 0;
    public startFrame: number = 0;


    constructor(textures: Texture[] | AnimatedSpriteTextureTimeObject[], autoUpdate?: boolean) {
        super(textures);
        this.convertToHeaven();
        this.endFrame = textures.length - 1;
        this.startFrame = 0;
    }

    get currentFrame() {
        if (isNaN(this._currentTime)) return this.startFrame;
        var currentFrame = this.startFrame + Math.floor(this._currentTime) % (this.endFrame - this.startFrame + 1);

        if (currentFrame < 0) {
            currentFrame += this._textures.length;
        }

        return isNaN(currentFrame)?1:currentFrame;
    }

    loopFromTo(startFrame: number, endFrame: number) {
        this.endFrame = endFrame;
        this.startFrame = startFrame;

        if (startFrame == endFrame) {
            this.loop = false;
            this.gotoAndStop(startFrame);
        } else {
            this.loop = true;
            this.gotoAndPlay(this.startFrame);
        }
    }
}