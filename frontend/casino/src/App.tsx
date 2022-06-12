import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import "./App.css";

function App() {
  const [messages, setMessages] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // return;
    console.log("Will try to connect to socket");
    const socket = io("ws://localhost:3001", {
      reconnectionDelayMax: 10000,
      auth: {
        token: "123",
      },
      query: {
        "my-key": "my-value",
      },
    });

    if (socket) {
      socketRef.current = socket;
    }
    socket.on("chat-msg", (data: string) => {
      console.log("CHAT MSG EVENT", data);
      setMessages((curr) => {
        return [...curr, data];
      });
    });
    console.log("SOCKET INITIATED:", socket);

    return () => {
      socket.disconnect();
    };
  }, []);

  function emit(msg: string) {
    if (socketRef.current) {
      socketRef.current.emit("chat-msg", msg);
    }
  }

  return (
    <div className="App">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          console.log("will send", message);
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
          <span>{m}</span>
        ))}
      </div>
    </div>
  );
}

export default App;
