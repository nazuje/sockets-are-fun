import * as redis from "redis";
import { config } from "./config";
import { Game } from "./types/game-types";
import { SocketUser } from "./types/socketio-types";

const { host, port } = config.redis;
export const redisClient = redis.createClient({
  url: `redis://${host}:${port}`,
});

// Would probably use simple key/value (string|string) for storing a single game and use JSON.stringify or redisJSON for stringifying objects.
// The alternative would be to use redis HASHES. Drawback of hashes is they have to be flat. we can test both and see what works better for use
// https://alexandergugel.svbtle.com/storing-relational-data-in-redis
// https://developer.redis.com/howtos/redisjson/using-nodejs
// https://redis.io/docs/stack/json/
// https://faun.pub/the-two-ways-of-storing-nested-dictionaries-in-redis-3404bedb198b

// Would probably use ORDERED SET to keep the list of all the active games stored. Alternatively we can look into hashed or lists as well. We can even use JSON or HASH for this as well
// Might be best just to have an HASH with JSON. We can sort fetched hash later with javascript.

// redis.json needs to be installed on Redis server as redis-stack on the machine, so we 1st need to check if this will work in gcloud
// untill then ill jsut use JSON from JS. redis.json is much better tho and allows for many different manipulations.
// https://redis.io/docs/stack/get-started/install/mac-os/

async function addOrUpdateGameInRedis(game: Game) {
  // const allKeys = await redisClient.keys("*");

  const { id } = game;
  try {
    const stringifiedGame = JSON.stringify(game);
    const rH = await redisClient.hSet("games", id, stringifiedGame);
    console.log("Added game to hash succes:", rH);
    // const r = await redisClient.json.set(`game-${id}`, ".", game);
    const r = await redisClient.set(`game-${id}`, stringifiedGame);
    console.log("Added game succes:", r);
    return r;
  } catch (err) {
    console.log("ERROR", err);
    return null;
  }
}

async function getAllGamesFromRedis() {
  try {
    const len = await redisClient.hLen("games");
    if (!len) return [];

    const r = await redisClient.hGetAll("games");

    // Think if below makes sense or if this will get very slow for a huge amount of games
    const games = Object.keys(r).map((key) => {
      const parsedGame = JSON.parse(r[key]);
      return {
        ...parsedGame,
      };
    });

    console.log("All games from redis:", games);
    return games as Game[];
  } catch (err) {
    console.log(err);
    return [];
  }
}

async function getGameFromRedis(id: string) {
  try {
    // const game = await redisClient.json.get(`game-${id}`);
    const game = await redisClient.get(`game-${id}`);
    console.log("Game from redis:", game);
    if (game === null) return game;
    return JSON.parse(game) as Game;
  } catch (err) {
    return null;
  }
}

async function deleteGameInRedis(id: Game["id"]) {
  try {
    const r = await Promise.allSettled([
      redisClient.del(`game-${id}`),
      redisClient.hDel(`games`, id),
    ]);
    return r;
  } catch (err) {
    console.log("err in deleteGameInRedis", err);
    return null;
  }
}

async function addOrUpdateUserInRedis({
  socketId,
  user,
  rooms = [],
}: SocketUser) {
  if (!socketId) return null;
  try {
    const toStore = { ...user, rooms };
    // const r = await redisClient.json.set(`user-${id}`, ".", user);
    const r = await redisClient.set(
      `user-${socketId}`,
      JSON.stringify(toStore)
    );
    console.log("Added user to redis:", r);
    return r;
  } catch (err) {
    console.log("err in addOrUpdateUserInRedis", err);
    return null;
  }
}

async function getUserFromRedis(socketId: string) {
  if (!socketId) return null;
  try {
    const r = await redisClient.get(`user-${socketId}`);
    console.log("User tfrom redis:", r);
    if (r !== null) {
      return JSON.parse(r) as SocketUser;
    }
    return r;
  } catch (err) {
    console.log("err in getUserFromRedis", err);
    return null;
  }
}

async function deleteUserInRedis(socketId: string) {
  try {
    const r = await Promise.allSettled([
      redisClient.get(`user-${socketId}`),
      redisClient.del(`user-${socketId}`),
    ]);
    if (r[0].status === "fulfilled" && r[0].value) {
      return JSON.parse(r[0].value) as SocketUser;
    }
    return null;
  } catch (err) {
    console.log("err in deleteUserInRedis", err);
    return null;
  }
}

export {
  addOrUpdateGameInRedis,
  getGameFromRedis,
  getAllGamesFromRedis,
  addOrUpdateUserInRedis,
  deleteGameInRedis,
  deleteUserInRedis,
  getUserFromRedis,
};
