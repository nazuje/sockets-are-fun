import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { addMessageToCache, getMessagesFromCache, redisClient } from "./redis";
import { config } from "./config";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "./socketio-types";

const { port } = config.server;

// Code	Message

// 0	"Transport unknown"
// 1	"Session ID unknown"
// 2	"Bad handshake method"
// 3	"Bad request"
// 4	"Forbidden"
// 5	"Unsupported protocol version"

const app = express();
const httpServer = createServer(app);
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(httpServer, {
  cors: {
    origin: "*",
  },
});

const subClient = redisClient.duplicate();

Promise.all([redisClient.connect(), subClient.connect()]).then(() => {
  io.adapter(createAdapter(redisClient, subClient));
  // io.listen(port);
});

// [END cloudrun_websockets_redis_adapter]
// Add error handlers
redisClient.on("error", (err) => {
  console.error(err.message);
});

subClient.on("error", (err) => {
  console.error(err.message);
});

app.get("/", (req, res) => {
  res.send({ status: "up" });
});

io.on("connection", (socket) => {
  console.log("New connection", socket.id);

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected", reason);
    // ...
  });
  socket.on("disconnecting", (reason) => {
    for (const room of socket.rooms) {
      if (room !== socket.id) {
        // socket.to(room).emit("user has left", socket.id);
      }
    }
  });

  socket.emit("basicEmit", 1, "2", Buffer.from([3]));

  socket.on("userSentMessage", async (msg) => {
    console.log("CHAT MSG EVENT", msg);
    io.emit("newMessageAdded", msg);
    await addMessageToCache(msg.message);
    const messages = await getMessagesFromCache();
    console.log("Messages from redis after added new:", messages);
  });

  // MIDDLEWARES:
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
