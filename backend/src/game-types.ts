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
