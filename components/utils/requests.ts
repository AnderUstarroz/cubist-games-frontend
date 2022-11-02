import {
  arweave_json,
  compress_image,
  isRejected,
  SolanaProgramType,
  terms_pda,
} from "@cubist-collective/cubist-games-lib";
import { flashMsg } from "./helpers";
import { BN } from "@project-serum/anchor";
import {
  get_cached_game,
  get_cached_terms,
  put_cached_game,
  put_cached_terms,
} from "../../components/utils/db";
import { GamesType, GameTermsType, GameType } from "../../pages/types/game";
import { PublicKey } from "@solana/web3.js";
import { game_pda } from "@cubist-collective/cubist-games-lib";
import { rustToInputsSettings } from "./game-settings";
export type MultiRequestType = [Function, any[]];
export const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const new_domain = (domain: string) => {
  return typeof window !== "undefined" && domain !== window.location.host;
};

export const multi_request = async (
  requests: MultiRequestType[]
): Promise<any[]> => {
  const data = await Promise.allSettled(
    requests.map(async (params: MultiRequestType) => params[0](...params[1]))
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
): Promise<GameType[]> => {
  let pdas = (
    await Promise.allSettled(
      gameIds.map(async (id: number) => game_pda(authority, new BN(id)))
    )
  ).map((r: any) => r.value);
  let gamesData: any = await Promise.allSettled(
    pdas.map(async (pda: [PublicKey, number]) =>
      solanaProgram.account.game.fetch(pda[0])
    )
  );
  let games: GamesType = {};
  // Filter out not existing games:
  gamesData = gamesData
    .filter((g: any) => g.status === "fulfilled")
    .map((g: any) => {
      const data = rustToInputsSettings(g.value, 9);
      games[data.gameId] = {
        data: data,
        cached: {
          gameId: data.gameId,
          definitionHash: null,
          image1Hash: null,
          definition: null,
          image1: null,
          thumb1: null,
        },
      };
      return data;
    });

  // Fetch cached games:
  let cachedGames = await Promise.allSettled(
    gamesData.map(async (game: any) => get_cached_game(game.gameId))
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
      games[gamesData[k].gameId].cached = g.value;
      return;
    }
    // Fetch assets when cached game doesn't exist or is outdated
    missingAssets.push([gamesData[k].gameId, gamesData[k].definitionHash]);
    if (gamesData[k].image1Hash) {
      missingAssets.push([gamesData[k].gameId, gamesData[k].image1Hash]);
    }
  });
  // Fetch missing assets
  if (missingAssets.length) {
    let fetchedGames: number | null[] = await Promise.all(
      (
        await Promise.allSettled(
          missingAssets.map(async (requests: [number, string]) =>
            fetch(`https://arweave.net/${requests[1]}`)
          )
        )
      ).map(async (r: any, k: number) => {
        if (r.status !== "fulfilled") return null;
        const gameId = missingAssets[k][0];
        if (/application\/json/.test(r.value.headers.get("Content-Type"))) {
          games[gameId].cached.definition = await r.value.json();
          games[gameId].cached.definitionHash = missingAssets[k][1];
          return gameId;
        }
        const imageBlob = await r.value.blob();
        games[gameId].cached.image1Hash = missingAssets[k][1];
        games[gameId].cached.image1 = imageBlob;
        games[gameId].cached.thumb1 = await compress_image(
          imageBlob,
          100,
          imageBlob.type
        );
        return gameId;
      })
    );
    // Remove duplicates, and cache result
    for (const gameId of new Set(fetchedGames)) {
      if (gameId !== null) {
        put_cached_game(games[gameId].cached);
      }
    }
  }
  // Sort by Newest -> Oldest
  return Object.keys(games)
    .map((gameId: string) => parseInt(gameId))
    .sort()
    .reverse()
    .map((gameId: number) => games[gameId]);
};

export const fetch_terms = async (
  solanaProgram: SolanaProgramType,
  termsId: string,
  termsHash: string
): Promise<GameTermsType> => {
  let terms = await get_cached_terms(termsId);
  if (!terms || terms.hash != termsHash) {
    console.log("entra a buscar terms");
    try {
      const [termsPda, _] = await terms_pda(
        new PublicKey(process.env.NEXT_PUBLIC_AUTHORITY as string),
        termsId
      );
      terms = {
        agreed: false,
        hash: termsHash,
        ...(await arweave_json(
          (
            await solanaProgram.account.terms.fetch(termsPda)
          ).arweaveHash
        )),
      };
      put_cached_terms(terms);
    } catch (error) {
      flashMsg("Failed to fetch Terms & Conditions");
      console.log(error);
    }
  }
  return terms;
};
