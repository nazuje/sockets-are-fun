import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import "./App.css";
import { Lobby } from "./Lobby";
import { ClientToServerEvents, ServerToClientEvents } from "./socketio-types";

const runUrl = "ws-testp-5swmx4bxtq-ue.a.run.app";
const localUrl = "localhost:8080";

function App() {
  const [messages, setMessages] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const socketRef = useRef<Socket<
    ServerToClientEvents,
    ClientToServerEvents
  > | null>(null);

  useEffect(() => {
    console.log("Will try to connect to socket");
    const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
      `ws://${runUrl}`,
      {
        reconnectionDelayMax: 10000,
        auth: {
          token: "123",
        },
        query: {
          "my-key": "my-value",
        },
      }
    );

    if (socket) {
      socketRef.current = socket;
    }

    socket.on("connect", () => {
      console.log("Socket connected");
    });
    socket.on("connect_error", () => {});
    socket.on("disconnect", () => {});
    socket.on("basicEmit", (a, b, c) => {
      console.log("Received basic emit", a, b, c);
    });
    socket.on("newMessageAdded", (data) => {
      console.log("CHAT MSG EVENT received", data);
      setMessages((curr) => {
        return [...curr, data.message];
      });
    });
    console.log("SOCKET INITIATED:", socket);

    return () => {
      socket.disconnect();
    };
  }, []);

  function emit(msg: string) {
    if (socketRef.current && socketRef.current.connected) {
      console.log("will send", msg);
      socketRef.current.emit("userSentMessage", {
        id: socketRef.current.id,
        message: msg,
        timestamp: Date.now(),
      });
    }
  }

  return (
    <div className="App">
      <Lobby />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          emit(message);
          setMessage("");
        }}
      >
        <input
          value={message}
          placeholder="insert message"
          onChange={(e) => setMessage(e.target.value)}
        />
      </form>
      <span>MESSAGES:</span>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {messages.map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
    </div>
  );
}

export default App;
