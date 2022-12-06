import { PrevGameType } from "../../pages/types/game";
import {
  GameSettingsInputType,
  OptionInputType,
  GameStateOutputType,
} from "../../pages/types/game-settings";

export const game_batch = (maxGameId: number, max = 10): number[] => {
  // Returns a list with the Game ids in descendent order
  let batch: number[] = [];
  for (let i = 0; i < max; i++) {
    if (maxGameId - i <= 0) {
      break;
    }
    batch.push(maxGameId - i);
  }
  return batch;
};

export const game_state = (
  game: GameSettingsInputType
): GameStateOutputType => {
  const now = new Date();
  if (game.settledAt) {
    return game.state.hasOwnProperty("Voided") ? "Voided" : "Settled";
  }
  if (now < game.openTime) {
    return "Pending";
  }
  if (now >= game.openTime && now < game.closeTime) {
    return "Open";
  }
  return "Closed";
};

// Returns POT in SOL
export const get_pot = (game: GameSettingsInputType): number => {
  return game.options.reduce(
    (acc: number, current: OptionInputType) => acc + current.totalStake,
    0
  );
};

export const update_prev_game = (
  game: GameSettingsInputType,
  useEmptyValues = false
): PrevGameType => {
  return game.options.reduce(
    (acc: any, o: OptionInputType) => {
      if (useEmptyValues) {
        acc[`option${o.id}`] = 0;
      } else {
        acc.pot += o.totalStake;
        acc[`option${o.id}`] = o.totalStake;
      }
      return acc;
    },
    { pot: 0 }
  );
};

export const tx_link = (signature: string): string => {
  return `https://explorer.solana.com/tx/${signature}${
    process.env.NEXT_PUBLIC_SOLANA_NETWORK === "devnet" ? "?cluster=devnet" : ""
  }`;
};

export const DEFAULT_SELECT_STYLES = {
  control: (baseStyles: any, state: any) => ({
    ...baseStyles,
    backgroundColor: "var(--inputBg0)",
    borderColor: "var(--inputBorder0)",
  }),
  singleValue: (baseStyles: any, state: any) => ({
    ...baseStyles,
    color: "var(--inputColor0)",
  }),
  menu: (baseStyles: any, state: any) => ({
    ...baseStyles,
    color: "var(--inputColor0)",
    backgroundColor: "var(--inputBg0)",
  }),
  option: (baseStyles: any, state: any) => {
    return {
      ...baseStyles,
      color: "var(--inputColor0)",
      backgroundColor: "var(--inputBg0)",
      ":hover": {
        ...baseStyles[":hover"],
        backgroundColor: state.isFocused ? "var(--color17)" : "var(--inputBg0)",
      },
      ":active": {
        ...baseStyles[":active"],
        backgroundColor: state.isSelected
          ? "var(--color17)"
          : "var(--inputBg0)",
      },
    };
  },
};
