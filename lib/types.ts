export type Difficulty = "easy" | "medium" | "hard";
export type Answer = {
  rank: number;
  name: string;
  aliases?: string[];
  value?: string | number;
};
export type Category = {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  funnySubtitle: string;
  icon: string;
  tags: string[];
  difficulty: Difficulty;
  metric: string;
  sourceLabel: string;
  dataAsOf: string;
  answers: Answer[];
  nearMisses?: Answer[];
};
export type Player = { id: string; name: string; score: number; color: string };
export type Guess = {
  playerId: string;
  categoryId: string;
  input: string;
  answerName?: string;
  rank?: number;
  nearMissRank?: number;
  points: number;
  valid: boolean;
  duplicate?: boolean;
};
export type Round = { categoryId: string; guesses: Guess[] };
export type Game = {
  mode: "quick" | "full";
  players: Player[];
  categories: Category[];
  currentRound: number;
  currentPlayerIndex: number;
  guessesPerPlayer: number;
  revealAnswers: boolean;
  rounds: Round[];
  status: "playing" | "round-result" | "finished";
};
