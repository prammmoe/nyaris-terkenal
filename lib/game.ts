import { Answer, Category, Game, Guess, Player } from "./types";

export const normalizeAnswer = (value: string) =>
  value
    .toLocaleLowerCase("id-ID")
    .trim()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
const compact = (value: string) => normalizeAnswer(value).replace(/\s/g, "");
const numbers = (value: string) => normalizeAnswer(value).match(/\d+/g) || [];
const sameNumbers = (left: string, right: string) =>
  numbers(left).join(",") === numbers(right).join(",");
const distance = (left: string, right: string) => {
  const rows = Array.from({ length: left.length + 1 }, (_, index) => [index]);
  for (let column = 0; column <= right.length; column++)
    rows[0][column] = column;
  for (let row = 1; row <= left.length; row++)
    for (let column = 1; column <= right.length; column++)
      rows[row][column] =
        left[row - 1] === right[column - 1]
          ? rows[row - 1][column - 1]
          : 1 +
            Math.min(
              rows[row - 1][column],
              rows[row][column - 1],
              rows[row - 1][column - 1],
            );
  return rows[left.length][right.length];
};
const unique = (answers: Answer[]) =>
  Array.from(new Map(answers.map((answer) => [answer.name, answer])).values());
const forms = (answer: Answer) => [answer.name, ...(answer.aliases || [])];
const matchAnswers = (answers: Answer[], input: string) => {
  const normalized = normalizeAnswer(input);
  const condensed = compact(input);
  if (!normalized) return undefined;
  const exact = unique(
    answers.filter((answer) =>
      forms(answer).some(
        (form) =>
          normalizeAnswer(form) === normalized || compact(form) === condensed,
      ),
    ),
  );
  if (exact.length === 1) return exact[0];
  if (exact.length > 1) return undefined;
  const compatible = (form: string) => sameNumbers(input, form);
  const prefix = unique(
    answers.filter((answer) =>
      forms(answer).some(
        (form) =>
          compatible(form) &&
          normalized.length >= 4 &&
          (normalizeAnswer(form).startsWith(normalized) ||
            normalizeAnswer(form)
              .split(" ")
              .some((token) => token.startsWith(normalized))),
      ),
    ),
  );
  if (prefix.length === 1) return prefix[0];
  if (prefix.length > 1) return undefined;
  const threshold = condensed.length <= 7 ? 1 : 2;
  const fuzzy = unique(
    answers.filter((answer) =>
      forms(answer).some(
        (form) =>
          compatible(form) &&
          condensed.length >= 3 &&
          distance(condensed, compact(form)) <= threshold,
      ),
    ),
  );
  return fuzzy.length === 1 ? fuzzy[0] : undefined;
};
export const findAnswer = (
  category: Category,
  input: string,
): Answer | undefined => matchAnswers(category.answers, input);
export const findNearMiss = (
  category: Category,
  input: string,
): Answer | undefined => matchAnswers(category.nearMisses || [], input);
export const calculateScore = (answer?: Answer) => answer?.rank ?? 0;
export const isDuplicateGuess = (guesses: Guess[], answer?: Answer) =>
  !!answer && guesses.some((g) => g.answerName === answer.name && g.valid);
export const calculateLeaderboard = (players: Player[]) =>
  [...players].sort(
    (a, b) => b.score - a.score || a.name.localeCompare(b.name),
  );
export const selectRandomCategories = (
  all: Category[],
  selected: Category[],
  total: number,
) => {
  const pool = all.filter((c) => !selected.some((s) => s.id === c.id));
  return [
    ...selected,
    ...pool
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.max(0, total - selected.length)),
  ];
};
export const isRoundComplete = (game: Game) =>
  game.rounds[game.currentRound].guesses.filter((g) => !g.duplicate).length >=
  game.players.length * game.guessesPerPlayer;
export function submitGuess(
  game: Game,
  input: string,
): { game: Game; guess: Guess } {
  const category = game.categories[game.currentRound];
  const round = game.rounds[game.currentRound];
  const player = game.players[game.currentPlayerIndex];
  const answer = findAnswer(category, input);
  const nearMiss = answer ? undefined : findNearMiss(category, input);
  const duplicate = isDuplicateGuess(round.guesses, answer);
  const guess: Guess = {
    playerId: player.id,
    categoryId: category.id,
    input,
    answerName: answer?.name,
    rank: answer?.rank,
    nearMissRank: nearMiss?.rank,
    points: duplicate ? 0 : calculateScore(answer),
    valid: !!answer,
    duplicate,
  };
  if (duplicate) return { game, guess };
  const players = game.players.map((p) =>
    p.id === player.id ? { ...p, score: p.score + guess.points } : p,
  );
  const rounds = game.rounds.map((r, i) =>
    i === game.currentRound ? { ...r, guesses: [...r.guesses, guess] } : r,
  );
  const updated = {
    ...game,
    players,
    rounds,
    currentPlayerIndex: (game.currentPlayerIndex + 1) % players.length,
  };
  return {
    guess,
    game: {
      ...updated,
      status: isRoundComplete(updated) ? "round-result" : "playing",
    },
  };
}
