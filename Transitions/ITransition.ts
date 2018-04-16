import {Stage} from "../../Stages/Stage";

export interface ITransition {
    Run(prevStage: Stage, newStage: Stage)
}