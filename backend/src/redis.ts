import * as redis from "redis";
import { config } from "./config";

const { host, port } = config.redis;
export const redisClient = redis.createClient({
  url: `redis://${host}:${port}`,
});
// [END cloudrun_websockets_redis]

// Set up to use promises and async/await for Redis methods
// const redisGet = promisify(redisClient.get).bind(redisClient);
// const redisExists = promisify(redisClient.exists).bind(redisClient);

// // Insert new messages into the Redis cache
async function addMessageToCache(msg: string) {
  // Check for current cache
  // let room = await getRoomFromCache(roomName);
  // if (room) {
  //   // Update old room
  //   room.messages.push(msg);
  // } else {
  //   // Create a new room
  //   room = {
  //     room: roomName,
  //     messages: [msg],
  //   };
  // }

  if (!(await redisClient.exists("messages"))) {
    console.log("Messages dont exist, will create them");
    return redisClient.set("messages", JSON.stringify([msg]));
  } else {
    console.log("Messages exist, will GET them");
    const messages = await redisClient.get("messages");
    console.log("Messages:", messages, typeof messages);
    if (!messages) {
      return redisClient.set("messages", JSON.stringify([msg]));
    }

    const parsed =
      typeof messages === "string" ? JSON.parse(messages) : messages;
    parsed.push(msg);
    return redisClient.set("messages", JSON.stringify(parsed));
  }

  // redisClient.set(roomName, JSON.stringify(room));
  // Insert message to the database as well
  // addMessageToDb(room);
}

async function getMessagesFromCache(): Promise<string[] | null> {
  const messages = await redisClient.get("messages");
  if (messages === null) {
    return messages;
  }
  return messages === "string" ? JSON.parse(messages) : messages;
}

// // Query Redis for messages for a specific room
// // If not in Redis, query the database
// async function getRoomFromCache(roomName: string) {
//   if (!(await redisClient.exists(roomName))) {
//     const room = getRoomFromDatabase(roomName);
//     if (room) {
//       await redisClient.set(roomName, JSON.stringify(room));
//     }
//   }
//   const finalRoom = await redisClient.get(roomName);
//   return typeof finalRoom === "string" ? JSON.parse(finalRoom) : finalRoom;
// }

// In-memory database example -
// Production applications should use a persistent database such as Firestore
const messageDb = [
  {
    room: "my-room",
    messages: [
      { user: "Chris", text: "Hi!" },
      { user: "Chris", text: "How are you!?" },
      { user: "Megan", text: "Doing well!" },
      { user: "Chris", text: "That's great" },
    ],
  },
  {
    room: "new-room",
    messages: [
      { user: "Chris", text: "The project is due tomorrow" },
      { user: "Chris", text: "I am wrapping up the final pieces" },
      { user: "Chris", text: "Are you ready for the presentation" },
      { user: "Megan", text: "Of course!" },
    ],
  },
];

// // Insert messages into the example database for long term storage
// async function addMessageToDb(data) {
//   const room = messageDb.find((messages) => messages.room === data.room);
//   if (room) {
//     // Update room in database
//     Object.assign(room, data);
//   } else {
//     // Create new room in database
//     messageDb.push(data);
//   }
// }

// // Query the example database for messages for a specific room
// function getRoomFromDatabase(roomName) {
//   return messageDb.find((messages) => messages.room === roomName);
// }

export { addMessageToCache, getMessagesFromCache };
