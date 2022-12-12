import styles from "./DefaultStakeButtons.module.scss";
import dynamic from "next/dynamic";
import { StakeButtonsPropsType, DefaultStakeButtonsPropsType } from "./types";
import React from "react";
import { OptionType } from "../../../types/game";
import { flashMsg } from "../../utils/helpers";
import { place_bet } from "../../utils/bet";
import { sol_to_lamports } from "@cubist-collective/cubist-games-lib";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Scrollbar, A11y } from "swiper";

const Button = dynamic(() => import("../../button"));
const Input = dynamic(() => import("../../input"));
const Modal = dynamic(() => import("../../modal"));
const Markdown = dynamic(() => import("../../markdown"));
const Spinner = dynamic(() => import("../../spinner"));

const Templates: any = {};

function DefaultStakeButtons({
  solanaProgram,
  connection,
  systemConfig,
  game,
  pdas,
  modals,
  setModals,
  customStake,
  setCustomStake,
  setWalletVisible,
  sendTransaction,
  termsAgreed,
  publickey,
  playerBets,
}: DefaultStakeButtonsPropsType) {
  const handlePlaceCustomStake = (optionId: number) => {
    const solAmount = parseFloat(customStake.stake);
    let error = false;
    if (solAmount < game.data.minStake) {
      error = true;
      flashMsg(`The minimum stake is ${game.data.minStake} SOL`);
    }
    const lamports = sol_to_lamports(solAmount);
    if (lamports % sol_to_lamports(game.data.minStep) !== 0) {
      error = true;
      flashMsg(
        `The minimum amount to increase/decrease a bet is ${game.data.minStep} SOL`
      );
    }
    if (error) {
      setCustomStake({
        ...customStake,
        error: error,
      });
      return;
    }
    place_bet(
      solanaProgram,
      connection,
      systemConfig,
      game,
      pdas,
      optionId,
      lamports,
      termsAgreed,
      publickey,
      modals,
      setModals,
      setWalletVisible,
      sendTransaction,
      playerBets
    );
  };
  return (
    <>
      <Modal modalId={"bet"} modals={modals} setIsOpen={setModals}>
        <Swiper
          modules={[Navigation, Pagination, Scrollbar, A11y]}
          pagination={{ clickable: true, dynamicBullets: true }}
          slidesPerView={1}
          spaceBetween={0}
          loop={true}
          loopFillGroupWithBlank={false}
          className={styles.swiper}
          navigation={true}
        >
          {game.cached.definition?.options.map(
            (o: OptionType, optionId: number) => (
              <SwiperSlide key={`betOpt${optionId}`}>
                <div>
                  <h4 className={`optColor${optionId}`}>{o.title}</h4>
                  <div className="betOptDesc">
                    {!!o.description && <Markdown>{o.description}</Markdown>}
                  </div>
                  {customStake.loading ? (
                    <Spinner />
                  ) : (
                    <>
                      <ul>
                        {game.data.stakeButtons.map(
                          (stakeAmount: number, k: number) => (
                            <li key={`stakeBtn${optionId}-${k}`}>
                              <Button
                                // style={{ backgroundColor: `opt${optionId}` }}
                                className={`optBg${optionId}`}
                                onClick={() => {
                                  try {
                                    setCustomStake({
                                      ...customStake,
                                      loading: true,
                                    });
                                    place_bet(
                                      solanaProgram,
                                      connection,
                                      systemConfig,
                                      game,
                                      pdas,
                                      optionId,
                                      sol_to_lamports(stakeAmount),
                                      termsAgreed,
                                      publickey,
                                      modals,
                                      setModals,
                                      setWalletVisible,
                                      sendTransaction,
                                      playerBets
                                    );
                                  } catch (e) {
                                    console.error(e);
                                  }
                                  setCustomStake({
                                    ...customStake,
                                    loading: false,
                                  });
                                }}
                              >
                                {stakeAmount} SOL
                              </Button>
                            </li>
                          )
                        )}
                      </ul>
                      {!!game.data.customStakeButton && (
                        <div className="customStake">
                          <label className="overlap fullWidth">
                            <Input
                              type="number"
                              autoComplete="off"
                              value={customStake.stake}
                              className="fullWidth"
                              placeholder={`Enter SOL amount`}
                              style={
                                customStake.error
                                  ? {
                                      borderColor: "var(--errorBg)",
                                    }
                                  : undefined
                              }
                              onClick={(e: any) => e.target.select()}
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                              ) =>
                                setCustomStake({
                                  ...customStake,
                                  error: false,
                                  id: optionId,
                                  stake: e.target.value,
                                })
                              }
                              maxLength="5"
                            />
                            <span>Custom stake</span>
                            <Button
                              className={`sm rounded optBg${optionId}`}
                              onClick={() => {
                                try {
                                  setCustomStake({
                                    ...customStake,
                                    id: optionId,
                                    loading: true,
                                  });
                                  handlePlaceCustomStake(optionId);
                                } catch (e) {
                                  console.error(e);
                                }
                                setCustomStake({
                                  ...customStake,
                                  loading: false,
                                });
                              }}
                            >
                              Bet
                            </Button>
                          </label>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </SwiperSlide>
            )
          )}
        </Swiper>
      </Modal>
    </>
  );
}

export default function StakeButtons({
  template,
  ...props
}: StakeButtonsPropsType) {
  const StakeButtons =
    template && Templates.hasOwnProperty(template)
      ? Templates[template]
      : DefaultStakeButtons;

  return <StakeButtons {...props} />;
}
