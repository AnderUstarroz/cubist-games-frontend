import { DefinitionInputsType } from "../../../pages/types/game";
import {
  ConfigInputType,
  GameSettingsInputType,
} from "../../../pages/types/game-settings";

export interface InfoPropsType {
  gameSettings: GameSettingsInputType;
  definition: DefinitionInputsType;
  config: ConfigInputType;
}
