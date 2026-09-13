import assert from "node:assert/strict";
import test from "node:test";
import { categories } from "../lib/data";
import {
  calculateScore,
  findAnswer,
  findNearMiss,
  normalizeAnswer,
  selectRandomCategories,
  submitGuess,
} from "../lib/game";
import { Category, Game } from "../lib/types";

const matcherCategory = {
  answers: [
    { rank: 11, name: "Spider-Man" },
    { rank: 12, name: "Spider-Man 2" },
    { rank: 13, name: "AT&T" },
    { rank: 14, name: "Maliq & D'Essentials" },
    { rank: 15, name: "Maliq Project" },
  ],
  nearMisses: [{ rank: 104, name: "Marmut Merah Jambu 2" }],
} as Category;

test("normalizes punctuation and aliases", () => {
  assert.equal(normalizeAnswer("  Sheila-On 7! "), "sheila on 7");
  assert.equal(findAnswer(categories[1], "SO7")?.name, "Sheila On 7");
});
test("uses the verified Data Gunung ordering for mountains", () => {
  const mountains = categories.find(
    (category) => category.id === "gunung-indonesia",
  );
  assert.equal(mountains?.sourceLabel, "Data Gunung");
  assert.equal(mountains?.answers.length, 100);
  assert.deepEqual(
    mountains?.answers
      .slice(0, 3)
      .map(({ rank, name, value }) => ({ rank, name, value })),
    [
      { rank: 1, name: "Puncak Jaya Wijaya", value: "4.884 m" },
      { rank: 2, name: "Kerinci", value: "3.805 m" },
      { rank: 3, name: "Rinjani", value: "3.726 m" },
    ],
  );
  assert.deepEqual(
    mountains?.answers
      .slice(-2)
      .map(({ rank, name, value }) => ({ rank, name, value })),
    [
      { rank: 99, name: "Halau-Halau", value: "1.901 m" },
      { rank: 100, name: "Telomoyo", value: "1.894 m" },
    ],
  );
  assert.equal(
    findAnswer(mountains!, "Puncak Jaya")?.name,
    "Puncak Jaya Wijaya",
  );
});
test("matches small typos and punctuation", () => {
  assert.equal(findAnswer(matcherCategory, "spderman")?.name, "Spider-Man");
  assert.equal(findAnswer(matcherCategory, "atnt")?.name, "AT&T");
});
test("never uses partial matching to bypass numbered titles", () => {
  assert.equal(findAnswer(matcherCategory, "spiderman")?.name, "Spider-Man");
  assert.equal(
    findAnswer(
      { ...matcherCategory, answers: [matcherCategory.answers[1]] },
      "spiderman",
    ),
    undefined,
  );
});
test("accepts only unambiguous short names", () => {
  assert.equal(
    findAnswer(categories[1], "Maliq")?.name,
    "Maliq & D'Essentials",
  );
  assert.equal(findAnswer(matcherCategory, "Maliq"), undefined);
  assert.equal(findAnswer(matcherCategory, "ma"), undefined);
});
test("finds optional near-miss ranks without scoring them", () => {
  assert.equal(findNearMiss(categories[0], "Marmut Merah Jambu 2")?.rank, 104);
});
test("near-misses display their rank but score zero", () => {
  const game = {
    mode: "quick",
    players: [{ id: "p1", name: "Pemain 1", score: 0, color: "#000" }],
    categories: [categories[0]],
    currentRound: 0,
    currentPlayerIndex: 0,
    guessesPerPlayer: 1,
    revealAnswers: false,
    rounds: [{ categoryId: categories[0].id, guesses: [] }],
    status: "playing",
  } as Game;
  const result = submitGuess(game, "Marmut Merah Jambu 2");
  assert.equal(result.guess.valid, false);
  assert.equal(result.guess.nearMissRank, 104);
  assert.equal(result.guess.points, 0);
  assert.equal(result.game.players[0].score, 0);
});
test("rank is score and missing answer scores zero", () => {
  assert.equal(calculateScore({ rank: 99, name: "x" }), 99);
  assert.equal(calculateScore(), 0);
});
test("random selection never repeats chosen categories", () => {
  const result = selectRandomCategories(categories, [categories[0]], 5);
  assert.equal(result.length, 5);
  assert.equal(new Set(result.map((x) => x.id)).size, 5);
});
test("full game can select ten unique rounds from fifteen categories", () => {
  assert.equal(categories.length, 15);
  for (const id of [
    "kampus-indonesia",
    "perusahaan-indonesia",
    "novel-indonesia",
    "game-populer",
    "atlet-indonesia",
  ])
    assert.ok(
      categories.find((category) => category.id === id)?.answers.length! > 20,
    );
  const rounds = selectRandomCategories(categories, [], 10);
  assert.equal(rounds.length, 10);
  assert.equal(new Set(rounds.map((category) => category.id)).size, 10);
  assert.equal(
    categories.filter(
      (category) => !rounds.some((round) => round.id === category.id),
    ).length,
    5,
  );
});
test("every category has a non-interactive source credit", () => {
  for (const category of categories) {
    assert.ok(category.sourceLabel);
    assert.ok(category.sourceUrl);
    assert.match(category.dataAsOf, /^(2025|2026)/);
    assert.ok(category.answers.length >= 25);
  }
});
