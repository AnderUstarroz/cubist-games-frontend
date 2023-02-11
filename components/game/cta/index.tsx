import { game_state } from "../../utils/game";
import { CTAPropsType, ShowCTA } from "./types";
import styles from "./CTA.module.scss";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  calculate_payment,
  lamports_to_sol,
  num_format,
  PlayerBetType,
} from "@cubist-collective/cubist-games-lib";
import { AnimatePresence } from "framer-motion";
import { calculate_stakes } from "../../utils/bet";
import { flashMsg } from "../../utils/helpers";

const MyBets = dynamic(() => import("../my-bets"));
const Button = dynamic(() => import("../../button"));
const Icon = dynamic(() => import("../../icon"));
const CountdownTimer = dynamic(() => import("../../countdown_timer"));
const ReactTooltip = dynamic(() => import("react-tooltip"), { ssr: false });

export default function CTA({
  publickey,
  game,
  template,
  myBets,
  playerBets,
  handleClaim,
  modals,
  setModals,
  termsAgreed,
}: CTAPropsType) {
  const [showMyBets, setShowMyBets] = useState<boolean>(false);
  const [showButton, setShowButton] = useState<ShowCTA>(ShowCTA.None);
  const gameState = game_state(game.data);

  const totalPrize = (): number => {
    if (!playerBets || !playerBets.bets.length) return 0;
    const [totalStake, winnerStake] = calculate_stakes(
      game.data.result as number,
      game.data.options
    );
    const myTotalStake = playerBets.bets.reduce(
      (acc: number, bet: PlayerBetType) => {
        if (gameState === "Voided") {
          return acc + bet.stake.toNumber();
        }
        return (
          acc + (bet.optionId === game.data.result ? bet.stake.toNumber() : 0)
        );
      },
      0
    );
    return gameState === "Voided"
      ? lamports_to_sol(myTotalStake)
      : lamports_to_sol(
          calculate_payment(
            myTotalStake,
            totalStake,
            winnerStake,
            game.data.fee
          )
        );
  };

  useEffect(() => {
    const handleShowButton = (): ShowCTA => {
      if (!publickey) return ShowCTA.Wallet;
      if (game.data.settledAt) {
        if (!playerBets) return ShowCTA.None;
        // Settled or Voided: Claim payment (only if has winner bets)
        for (const bet of playerBets.bets) {
          if (
            !bet.paid &&
            (bet.optionId === game.data.result || gameState === "Voided")
          ) {
            return gameState === "Voided" ? ShowCTA.Refund : ShowCTA.Pay;
          }
        }
        // Show Bet button if Game is open and active
      } else if (gameState === "Open" && game.data.isActive) {
        return ShowCTA.Bet;
      }
      return ShowCTA.None;
    };
    setShowButton(handleShowButton());
  });

  return (
    <>
      <div className={styles.CTA}>
        <div className={styles.btns}>
          <Button cType="transparent" className={styles.leftCTA}>
            <Link href="/">
              <a title="List of games" className="vAligned gap5">
                <Icon
                  cType="chevron"
                  width={12}
                  height={12}
                  className="icon1"
                />{" "}
                Back
              </a>
            </Link>
          </Button>
          <div className={styles.centerCTA}>
            {gameState === "Open" && (
              <CountdownTimer
                openTime={game.data.openTime}
                closeTime={game.data.closeTime}
                size="extra-small"
              />
            )}
          </div>
          <div className={styles.rightCTA}>
            <AnimatePresence>
              {!!publickey && (
                <Button
                  key="btn-mybets"
                  className={`btnRadius2 vAligned button1 ${styles.myBetsBtn} ${
                    showMyBets ? "showBets" : ""
                  }`}
                  onClick={() => setShowMyBets(!showMyBets)}
                >
                  My Bets ({myBets.length}) <Icon cType="chevron" />
                </Button>
              )}
              {showButton === ShowCTA.Wallet && (
                <Button key="btn-connWallet" cType="wallet" />
              )}
              {showButton === ShowCTA.Bet && (
                <Button
                  key="btn-bet"
                  className={`btnRadius2 vAligned gap5 pulsar0`}
                  onClick={() =>
                    termsAgreed
                      ? setModals({ ...modals, bet: true })
                      : flashMsg("You must accept the Terms & Conditions")
                  }
                >
                  <span className={styles.sol}>
                    <Icon
                      cType="sol"
                      width={8}
                      height={8}
                      color="var(--iconFill1)"
                    />
                  </span>{" "}
                  Bet
                </Button>
              )}
              {[ShowCTA.Pay, ShowCTA.Refund].includes(showButton) && (
                <Button
                  title={`Claim ${gameState === "Voided" ? "refund" : "prize"}`}
                  className={`${styles.claimBtn} pulsar0`}
                  key="btn-claim"
                  onClick={() => handleClaim(showButton, playerBets)}
                >
                  <span>
                    <Icon cType="award" width={20} height={20} />
                    <i>WINNER</i>
                  </span>
                  <span>
                    <strong>
                      Claim {gameState === "Voided" ? "refund" : "prize"}
                    </strong>
                    <span>+{num_format(totalPrize(), 4)} SOL</span>
                  </span>
                </Button>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div
          className={`${styles.myBetsWrapper} ${showMyBets ? "showBets" : ""}`}
        >
          <MyBets template={template} myBets={myBets} />
        </div>
      </div>
    </>
  );
}
