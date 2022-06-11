import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

// Code	Message
// 0	"Transport unknown"
// 1	"Session ID unknown"
// 2	"Bad handshake method"
// 3	"Bad request"
// 4	"Forbidden"
// 5	"Unsupported protocol version"

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  /* options */
  cors: {
    origin: "http://localhost:3000",
  },
});

app.get("/", (req, res) => {
  res.send("<h1>Hello world</h1>");
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
        socket.to(room).emit("user has left", socket.id);
      }
    }
  });

  socket.on("chat-msg", (msg) => {
    console.log("CHAT MSG EVENT", msg);
    io.emit("chat-msg", msg);
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
  headers["test"] = "123";
  headers["set-cookie"] = "mycookie=456";
});

io.engine.on("headers", (headers: any, req: any) => {
  headers["test"] = "789";
});

io.engine.on("connection_error", (err: any) => {
  console.log(err.req); // the request object
  console.log(err.code); // the error code, for example 1
  console.log(err.message); // the error message, for example "Session ID unknown"
  console.log(err.context); // some additional error context
});

httpServer.listen(3001);
