import { openDB } from "idb";
import { CachedGameType, GameTermsType } from "../../types/game";

const DB_NAME = `CubistGamesDB_${(
  process.env.NEXT_PUBLIC_AUTHORITY as string
).slice(0, 4)}`;
const GAME_STORE = "CubistGameStore";
const TERMS_STORE = "CubistTermsStore";
const getDB = async () => {
  return await openDB(
    DB_NAME,
    parseInt(process.env.NEXT_PUBLIC_DB_VERSION as string),
    {
      upgrade(db, oldVersion, newVersion, transaction) {
        // GAMES
        var gameStore = db.createObjectStore(GAME_STORE, {
          keyPath: "gameId",
        });
        gameStore.createIndex("gameId", "gameId", { unique: true });
        gameStore.createIndex("definitionHash", "definitionHash", {
          unique: true,
        });
        gameStore.createIndex("image1Hash", "image1Hash", { unique: true });
        gameStore.createIndex("definition", "definition", { unique: false });
        gameStore.createIndex("image1", "image1", { unique: false });
        gameStore.createIndex("thumb1", "thumb1", { unique: false });
        // TERMS
        var termsStore = db.createObjectStore(TERMS_STORE, {
          keyPath: "id",
        });
        termsStore.createIndex("id", "id", { unique: true });
        termsStore.createIndex("hash", "hash", { unique: true });
        termsStore.createIndex("title", "title", { unique: false });
        termsStore.createIndex("description", "description", { unique: false });
        termsStore.createIndex("agreed", "agreed", { unique: false });
      },
    }
  );
};

export const get_cached_game = async (gameId: number) => {
  const db = await getDB();
  return await db.get(GAME_STORE, gameId);
};
export const del_cached_game = async (gameId: number) => {
  const db = await getDB();
  await db.delete(GAME_STORE, gameId);
};
export const put_cached_game = async (game: CachedGameType) => {
  const db = await getDB();
  await db.put(GAME_STORE, game);
};

export const get_cached_terms = async (termsId: string) => {
  const db = await getDB();
  return await db.get(TERMS_STORE, termsId);
};

export const put_cached_terms = async (terms: GameTermsType) => {
  const db = await getDB();
  await db.put(TERMS_STORE, terms);
};

export default getDB;
