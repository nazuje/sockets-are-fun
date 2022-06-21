import { GameEnd, GameStart, Message, NewGame } from "./game-types";

export interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
  gameStarted: (data: GameStart) => void;
  gameEnded: (data: GameEnd) => void;
  newGameAdded: (data: NewGame) => void;
  newMessageAdded: (data: Message) => void;
}

export interface ClientToServerEvents {
  userJoinedLobby: () => void;
  userLeftLobby: () => void;
  userJoinedGame: () => void;
  userLeftGame: () => void;
  userStartedGame: () => void;
  userSentMessage: (data: Message) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  name: string;
  age: number;
}
