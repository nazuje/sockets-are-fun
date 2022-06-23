import { Game, Message } from "./game-types";

export interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;

  gameStarted: (data: Game) => void;
  gameEnded: (data: Game) => void;
  gameCreated: (data: Game) => void;
  gameUpdate: (data: Game) => void;

  allActiveGames: (data: any) => void;

  newMessageAdded: (data: Message) => void;
}

export interface ClientToServerEvents {
  joinRoom: (room: Room) => void;
  leaveRoom: (room: Room) => void;

  joinGame: () => void;
  leaveGame: () => void;

  userStartedGame: () => void;
  createGame: (game: Game) => void;

  userSentMessage: (data: Message) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  name: string;
  age: number;
}

export type Room = "game-lobby" | "notifications";
