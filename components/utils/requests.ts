import {
  fetch_pdas,
  isRejected,
  SolanaProgramType,
  var_to_str,
} from "@cubist-collective/cubist-games-lib";
import { flashMsg } from "./helpers";
import { BN } from "@project-serum/anchor";
import { get_cached_game } from "../../components/utils/db";
import { GamesType } from "../../pages/types/game";
import { PublicKey } from "@solana/web3.js";
import { game_pda } from "@cubist-collective/cubist-games-lib";
import { PDAType } from "../../pages/types/game-settings";
export type MultiRequestType = [Function, any[]];
export const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const new_domain = (domain: string) => {
  return typeof window !== "undefined" && domain !== window.location.host;
};

export const multi_request = async (
  requests: MultiRequestType[]
): Promise<any[]> => {
  const data = await Promise.allSettled(
    requests.map((params: MultiRequestType) => params[0](...params[1]))
  );
  if (data.find(isRejected)) {
    const errorMsg = `Failed to fetch all requests`;
    flashMsg(errorMsg, "error");
    console.error(errorMsg, data);
    throw new Error(errorMsg);
  }
  return data.map((result: any) => result.value);
};

export const fetch_games = async (
  solanaProgram: SolanaProgramType,
  authority: PublicKey,
  gameIds: number[]
) => {
  let pdas = await fetch_pdas(
    gameIds.map((id: number) => [game_pda, authority, new BN(id)])
  );
  let gamesData: any = await Promise.allSettled(
    pdas.map((pda: PDAType) => solanaProgram.account.game.fetch(pda[0]))
  );
  let games: GamesType = {};
  // Filter out not existing games:
  gamesData = gamesData
    .filter((g: any) => g.status === "fulfilled")
    .map((g: any) => {
      games[g.value.gameId.toNumber()] = {
        data: g.value,
        cached: {
          gameId: g.value.gameId.toNumber(),
          definitionHash: null,
          image1Hash: null,
          definition: null,
          image1: null,
          thumb1: null,
          mimeType1: null,
        },
      };
      return g.value;
    });

  // Fetch already existing cached games:
  let cachedGames = await Promise.allSettled(
    gamesData.map((game: any) => get_cached_game(game.gameId.toNumber()))
  );

  // Populates games from cache or fetch missing assets:
  let missingAssets: any = [];
  cachedGames.map((g: any, k: number) => {
    if (
      g.status === "fulfilled" &&
      g.value &&
      g.value.definitionHash == games[g.value.gameId].data.definitionHash &&
      g.value.image1Hash == games[g.value.gameId].data.image1Hash
    ) {
      games[k].cached = g.value;
      return;
    }
    // Fetch assets when cached game doesn't exist or is outdated
    missingAssets.push([gamesData[k].gameId, gamesData[k].definitionHash]);
    debugger;
    if (gamesData[k].image1Hash) {
      missingAssets.push([gamesData[k].gameId, gamesData[k].image1Hash]);
    }
  });
  // Fetch missing assets
  if (missingAssets.length) {
    let fetchedAssets = (
      await Promise.allSettled(
        missingAssets.map((requests: [number, string]) =>
          fetch(`https://arweave.net/${requests[1]}`)
        )
      )
    ).map((r: any, k: number) => {
      console.log(r);
      const contentType = r.value.headers.get("Content-Type");
      if (/application\/json/.test(contentType)) {
      } else if (/imageMODIFYME/.test(contentType)) {
      }
      debugger;
    });
  }

  return games;
};
