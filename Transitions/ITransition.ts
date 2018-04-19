import {Stage} from "../Stage";

export interface ITransition {
    Run(prevStage: Stage, newStage: Stage)
}