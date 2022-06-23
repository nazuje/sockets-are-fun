import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import "./App.css";
import { Lobby } from "./Lobby";
import {
  ClientToServerEvents,
  Game,
  ServerToClientEvents,
} from "./socketio-types";

const runUrl = "ws-testp-5swmx4bxtq-ue.a.run.app";
const localUrl = "localhost:8080";

function App() {
  const [games, setGames] = useState<Game[]>([]);
  const [newGame, setNewgame] = useState<Game | null>(null);
  const socketRef = useRef<Socket<
    ServerToClientEvents,
    ClientToServerEvents
  > | null>(null);

  useEffect(() => {
    console.log("Will try to connect to socket");
    const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
      `ws://${localUrl}`,
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
    socket.on("gameCreated", (data) => {
      console.log("gameCreated event received", data);
      setGames((curr) => {
        return [...curr, data];
      });
    });

    socket.on("allActiveGames", (data) => {
      console.log("Recevied all active games:", data);
    });
    console.log("socket initiated:", socket);

    return () => {
      socket.disconnect();
    };
  }, []);

  function emitCreateGame(msg: Game) {
    if (!newGame) return;
    if (socketRef.current && socketRef.current.connected) {
      console.log("will send", msg);
      socketRef.current.emit("createGame", newGame);
    }
  }

  return (
    <div className="App">
      <Lobby />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!newGame) return;
          emitCreateGame(newGame);
          setNewgame(null);
        }}
      >
        <input
          value={newGame?.id}
          placeholder="insert message"
          onChange={(e) =>
            setNewgame((curr) => {
              if (!curr) return { id: e.target.value };
              return { ...curr, id: e.target.value };
            })
          }
        />
      </form>
      <span>GAMES:</span>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {games.map((m) => (
          <button key={m.id}>NEW GAME: {m.id}</button>
        ))}
      </div>
    </div>
  );
}

export default App;
