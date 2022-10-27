import { GameSettingsInputType } from "../../pages/types/game-settings";

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

export const game_state = (game: GameSettingsInputType) => {
  const now = new Date();
  if (now < game.openTime) {
    return "Pending";
  }
  if (now >= game.openTime && now < game.closeTime) {
    return "Open";
  }
  if (game.settledAt) {
    return game.state.hasOwnProperty("Voided") ? "Voided" : "Settled";
  }
  return "Closed";
};
