import { ProfitShareInputType } from "../../pages/types/game-settings";

export function addProfitShare(
  profitSharing: ProfitShareInputType[],
  func: Function
) {
  let remaining =
    100 - profitSharing.reduce((prev, curr) => prev + curr.share, 0);
  if (remaining) {
    profitSharing.push({
      treasury: "",
      share: parseFloat(remaining.toFixed(2)),
    });
    func("profitSharing", profitSharing);
  }
}

export function profitSharingCompleted(profitSharing: ProfitShareInputType[]) {
  if (profitSharing.length >= 10) {
    return true;
  }
  return profitSharing.reduce((prev, curr) => prev + curr.share, 0) == 100;
}
