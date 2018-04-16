import {_, Main} from "../main";
import {TweenMax} from "./Application";

export class PauseTimer {
    private paused: boolean = false;
    private pauseStart: number = 0;
    private totalPauseTime: number = 0;
    private intervals: Array<any> = [];
    private timeouts: Array<any> = [];

    public since(time: number): number {
        return this.getTimer() - time
    }

    public process() {
    }

    public removeListener(f: any) {
        for (let i = 0; i < this.intervals.length; ++i) {
            if (this.intervals[i] == f) {
                this.intervals.splice(i, 1);
                i--;
            }
        }

        for (let i = 0; i < this.timeouts.length; ++i) {
            if (this.timeouts[i] == f) {
                this.timeouts.splice(i, 1);
                i--;
            }
        }
    }
    public getTimer() {
        return _.time - this.totalPauseTime;
    }

    public isPaused() {
        return this.paused;
    }

    public pause() {
        this.pauseStart = _.time;
        TweenMax.pauseAll();
        this.paused= true;
    }

    public resume() {
        if (!this.paused) return;
        this.totalPauseTime += (_.time - this.pauseStart);
        TweenMax.resumeAll();
        this.paused = false;
    }
}



