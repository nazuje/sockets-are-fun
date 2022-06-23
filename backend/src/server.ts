/* eslint-disable @typescript-eslint/no-empty-function */
import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import {
  addOrUpdateGameInRedis,
  getAllGamesFromRedis,
  getGameFromRedis,
  redisClient,
} from "./redis";
import { config } from "./config";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "./socketio-types";

// Code	Message
// 0	"Transport unknown"
// 1	"Session ID unknown"
// 2	"Bad handshake method"
// 3	"Bad request"
// 4	"Forbidden"
// 5	"Unsupported protocol version"

const { port } = config.server;

type TypedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

const app = express();
const httpServer = createServer(app);
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(httpServer, {
  pingInterval: 2500,
  pingTimeout: 20000,
  upgradeTimeout: 10000,
  cors: {
    origin: "*",
  },
});

// create duplicate of redis client to use as sub
const subClient = redisClient.duplicate();

Promise.all([redisClient.connect(), subClient.connect()])
  .then(() => {
    io.adapter(createAdapter(redisClient, subClient));
    // io.listen(port);
    console.log("HERE --");
    getGameFromRedis("random-id").then((r) => console.log("GAME:", r));
  })
  .catch((err) => {
    console.log("Err when connecting redis clients", err);
    //TO-DO: Handle connection errors
  });

redisClient.on("error", (err) => {
  console.error(err.message);
});

subClient.on("error", (err) => {
  console.error(err.message);
});

app.get("/", (_, res) => {
  res.send({ status: "up" });
});

// Event Handlers
// TO-DO: move them to separate file
function onConnection(socket: TypedSocket) {
  socket.on("disconnect", () => {});
  socket.on("disconnecting", (reason) => {
    for (const room of socket.rooms) {
      if (room !== socket.id) {
        // socket.to(room).emit("user has left", socket.id);
      }
    }
  });

  socket.on("userSentMessage", () => {});
}

// IO middlewares
io.use((socket, next) => {
  // The client can send credentials with the auth option:: plain object
  // const socket = io({
  //   auth: {
  //     token: "abc"
  //   }
  // });

  // // or with a function
  // const socket = io({
  //   auth: (cb) => {
  //     cb({
  //       token: "abc"
  //     });
  //   }
  // });
  // example of checking token:
  console.log("From IO middleware", socket);
  const token = socket.handshake.auth.token;
  console.log("From IO middleware - token received from handshake", token);
  //check token and decide how to proceed if needed.
  next();
});

async function joinSocketToRoomAndReturnAllGames(socket: TypedSocket) {
  socket.join("game-lobby");
  const allGames = await getAllGamesFromRedis();
  if (!allGames) {
    io.to(socket.id).emit("allActiveGames", []);
    return;
  }
  io.to(socket.id).emit("allActiveGames", allGames);
}

io.on("connection", async (socket) => {
  console.log("New connection", socket.id);
  onConnection(socket);
  joinSocketToRoomAndReturnAllGames(socket);

  socket.on("createGame", async (game) => {
    console.log("createGame event:", game);
    const gameAddedInRedis = await addOrUpdateGameInRedis(game);
    console.log("GAME ADDED AFRE EVENT:", gameAddedInRedis);
    const gameInRedis = await getGameFromRedis(game.id);
    console.log("new game created in Redis:", gameInRedis);

    io.emit("gameCreated", game);
  });

  // MIDDLEWARES for specific socket:
  socket.use(([event, ...args], next) => {
    // do something with the packet (logging, authorization, rate limiting...)
    // do not forget to call next() at the end
    next();
  });
  // socket.use(([event, ...args], next) => {
  //   if (isUnauthorized(event)) {
  //     return next(new Error("unauthorized event"));
  //   }
  //   next();
  // });

  socket.on("error", (err) => {
    if (err && err.message === "unauthorized event") {
      socket.disconnect();
    }
  });

  // ...
});

io.engine.on("initial_headers", (headers: any, req: any) => {
  // headers["test"] = "123";
  // headers["set-cookie"] = "mycookie=456";
});

io.engine.on("headers", (headers: any, req: any) => {
  // headers["test"] = "789";
});

io.engine.on("connection_error", (err: any) => {
  console.log(err.req); // the request object
  console.log(err.code); // the error code, for example 1
  console.log(err.message); // the error message, for example "Session ID unknown"
  console.log(err.context); // some additional error context
});

httpServer.listen(port, () => {
  console.log(`Listening on ${port}`);
});
