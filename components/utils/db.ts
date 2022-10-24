import { openDB } from "idb";

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
        gameStore.createIndex("mimeType1", "mimeType1", { unique: false });
        var termsStore = db.createObjectStore(TERMS_STORE, {
          keyPath: "id",
        });
        termsStore.createIndex("id", "id", { unique: true });
        termsStore.createIndex("terms", "terms", { unique: false });
      },
    }
  );
};

export const get_cached_game = async (gameId: number) => {
  const db = await getDB();
  await db.get(GAME_STORE, gameId);
};

// export const deleteGame = async (gameId: string) => {
//   const db = await getDB(wallet);
//   await db.delete(StoreName, nftPubkey);
// };

// export const replaceGame = async (game) => {
//   const db = await getDB(wallet);
//   await db.put(StoreName, nft);
// };

export default getDB;
