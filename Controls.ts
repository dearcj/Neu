/**
 * Created by MSI on 06.05.2017.
 */

/**
 * Created by MSI on 12.03.2017.
 */
export class Controls {
    gp: any;
    private buttonStates: Object = {};
    public onBtnPress:      Function;
    public onBtnRelease:    Function;
    public onLeft:          Function;
    public onRight:         Function;
    public onUp:            Function;
    public onDown:          Function;
    private prevX: number;
    private prevY: number;

    buttonPressed(b: any): boolean {
        if (typeof(b) == "object") {
            return b.pressed;
        }
        return b == 1.0;
    }

    onJoystickButtonPress(btn: number, state: boolean) {
        if (state) {
            if (this.onBtnPress)    this.onBtnPress(btn);
            if (this.onBtnRelease) this.onBtnRelease(btn)
        }
    }

    update(): void{
        let nav: any = navigator;
        let gamepads = navigator.getGamepads ? navigator.getGamepads() : (nav.webkitGetGamepads ? nav.webkitGetGamepads : []);
        this.gp = gamepads[0];

        if (this.gp) {
            if (this.gp.axes[0] != this.prevX && this.gp.axes[0] > .99 && this.onRight) this.onRight();
            if (this.gp.axes[0] != this.prevX && this.gp.axes[0] < -.99 && this.onLeft) this.onLeft();
            if (this.gp.axes[1] != this.prevY && this.gp.axes[1] > .99 && this.onUp) this.onUp();
            if (this.gp.axes[1] != this.prevY && this.gp.axes[1] < -.99 && this.onDown) this.onDown();

            this.prevX = this.gp.axes[0];
            this.prevY = this.gp.axes[1];

            for (let x = 0; x < this.gp.buttons.length; ++x) {
                let newBtnState = this.buttonPressed(this.gp.buttons[x]);
                if (newBtnState != this.buttonStates[x]) {
                    this.onJoystickButtonPress(x, newBtnState);
                }
                this.buttonStates[x] = newBtnState;
            }
        }
    }

    constructor () {
        let nav: any = navigator;
        let gamepads = navigator.getGamepads ? navigator.getGamepads() : (nav.webkitGetGamepads ? nav.webkitGetGamepads : []);
        this.gp = gamepads[0];
        window.addEventListener("gamepaddisconnected", (e) => {
            this.gp = null;
        }, false);

        window.addEventListener("gamepadconnected", (e: any) => {
            if (e.gamepad) {
                this.gp = navigator.getGamepads()[e.gamepad.index];
                console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
                    this.gp.index, this.gp.id,
                    this.gp.buttons.length, this.gp.axes.length);
            } else {
                this.gp = null;
            }
        });
    }

}