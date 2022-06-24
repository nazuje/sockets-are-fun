import { Game, Message } from "./game-types";

export interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;

  gameStarted: (data: Game) => void;
  gameEnded: (data: Game) => void;
  gameCreated: (data: Game) => void;
  gameUpdate: (data: Game) => void;

  userLeft: (data: any) => void;

  allActiveGames: (data: any) => void;

  newMessageAdded: (data: Message) => void;
}

export interface ClientToServerEvents {
  // has to be called from the client on every reconnect!
  updateSocketId: (prevSocketId?: string, userId?: string) => void;

  // These will basically act as subscriptions to specific 'rooms'
  joinRoom: (room: Room, callback?: (data: Game[] | null) => void) => void;
  leaveRoom: (room: Room) => void;

  // Specific to games. We still have to decidede hot to shape these and which to add and which not
  joinGame: () => void;
  leaveGame: () => void;
  userStartedGame: () => void;
  createGame: (game: Game) => void;
  // TO-DO: decide if we want to split the updateGame to many different events
  updateGame: (game: Game) => void;

  // random other stuff
  userSentMessage: (data: Message) => void;
}

export type Room = "game-battles" | "notifications";

export type User = {
  id: string;
  tokenId: string;
};

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  name: string;
  age: number;
}

export type SocketUser = {
  user: User;
  socketId: string;
  rooms: Room[];
};
