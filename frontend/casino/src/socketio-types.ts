export interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: any) => void;
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
  leaveRoom: () => void;

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

export type User = {
  id: string;
  tokenId: string;
};

export type Round = {
  id: string;
};

export type GameStatus = "CREATED" | "IN_PROGRESS" | "COMPLETED";
export type GameType = "BOX";

export type Game = {
  id: string;
  players?: User[];
  rounds?: Round[];
  activeRound?: Round;
  boxes?: string[];
  status?: GameStatus;
  numOfPlayers?: number;
  isPrivate?: boolean;
  type?: GameType;
};

export type Message = {
  id: string;
  message: string;
  timestamp: number;
};
