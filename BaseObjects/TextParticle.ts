import {O} from "./O";
import {TextBox} from "./TextBox";

export class TextParticle extends TextBox {
    process() {
        super.process();
        this.v[1] *= 0.97;
    }
}