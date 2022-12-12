import { DefinitionInputsType } from "../../../types/game";
import {
  ConfigInputType,
  GameSettingsInputType,
} from "../../../types/game-settings";

export interface InfoPropsType {
  gameSettings: GameSettingsInputType;
  definition: DefinitionInputsType;
  config: ConfigInputType;
}
