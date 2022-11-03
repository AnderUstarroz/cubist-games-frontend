import dynamic from "next/dynamic";
import { CTAPropsType, ShowCTA } from "./types";
import styles from "./CTA.module.scss";
import CountUp from "react-countup";
import { game_state, get_pot } from "../../utils/game";

const MyBets = dynamic(() => import("../my-bets"));
const Button = dynamic(() => import("../../button"));

export default function CTA({
  game,
  prevGame,
  template,
  myBets,
  playerBets,
  handleClaim,
}: CTAPropsType) {
  const handleShowButton = (): ShowCTA => {
    if (game.data.settledAt) {
      if (!playerBets) return ShowCTA.None;
      // Voided: Claim refund
      if (game.data.state.hasOwnProperty("voided")) {
        return playerBets.bets.length ? ShowCTA.Refund : ShowCTA.None;
      }
      // Settled: Claim payment (only if has winner bets)
      for (const bet of playerBets.bets) {
        if (!bet.paid && bet.optionId === game.data.result) {
          return ShowCTA.Pay;
        }
      }
      // Show Bet button if Game is open and active
    } else if (game_state(game.data) === "Open" && game.data.isActive) {
      return ShowCTA.Bet;
    }
    return ShowCTA.None;
  };
  const showButton = handleShowButton();

  return (
    <div className={styles.CTA}>
      <div className={styles.firstRow}>
        {game.data.showPot && (
          <div>
            <CountUp
              start={prevGame.pot}
              end={get_pot(game.data)}
              decimals={2}
              decimal="."
              suffix="◎"
            />
          </div>
        )}
        <div>Counter</div>
        <div>
          {showButton === ShowCTA.Bet && <Button>Bet</Button>}
          {[ShowCTA.Pay, ShowCTA.Refund].includes(showButton) && (
            <Button onClick={() => handleClaim(showButton, playerBets)}>
              Claim
            </Button>
          )}
        </div>
      </div>
      <MyBets template={template} myBets={myBets} />
    </div>
  );
}
