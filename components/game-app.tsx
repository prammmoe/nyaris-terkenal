"use client";
import Link from "next/link";
import posthog from "posthog-js";
import { useEffect, useMemo, useState } from "react";
import packageJson from "../package.json";
import { allTags, categories } from "../lib/data";
import {
  calculateLeaderboard,
  selectRandomCategories,
  submitGuess,
} from "../lib/game";
import { Category, Game, Guess, Player } from "../lib/types";

const colors = [
  "#ef3e36",
  "#2457e6",
  "#088b5b",
  "#7b3fd1",
  "#e07610",
  "#ce2675",
  "#087f8c",
];
const reactions = (rank?: number, valid = false) =>
  !valid
    ? [
        "Tidak masuk 😭",
        "Source: trust me bro.",
        "Bro invented an answer.",
        "Google pun bingung.",
      ]
    : rank! <= 10
      ? [
          "Kepopuleran adalah musuh.",
          "Terlalu terkenal 😭",
          "NPC answer detected.",
        ]
      : rank! <= 40
        ? ["Lumayan.", "Masih terlalu mainstream.", "Not bad."]
        : rank! <= 70
          ? [
              "Nah, mulai sulit ditebak.",
              "Knowledge mulai berguna.",
              "Ini baru main.",
            ]
          : rank! <= 90
            ? ["SHEESH.", "Deep cut.", "Certified nerd."]
            : [
                "BARELY MADE IT 🔥",
                "ABSOLUTE CINEMA.",
                "Satu bangsa bangga padamu.",
              ];
const pick = (items: string[]) =>
  items[Math.floor(Math.random() * items.length)];
const freshGame = (
  mode: "quick" | "full",
  cats: Category[],
  names: string[],
  guesses: number,
  reveal: boolean,
): Game => ({
  mode,
  players: names
    .filter(Boolean)
    .map((name, i) => ({ id: `p${i}`, name, score: 0, color: colors[i] })),
  categories: cats,
  currentRound: 0,
  currentPlayerIndex: 0,
  guessesPerPlayer: guesses,
  revealAnswers: reveal,
  rounds: cats.map((c) => ({ categoryId: c.id, guesses: [] })),
  status: "playing",
});
const categoryTone = (category: Category) =>
  `tone-${category.id.charCodeAt(0) % 4}`;

function Nav() {
  return (
    <nav>
      <Link href="/" className="brand">
        <span>NT</span> Nyaris Terkenal <small>v{packageJson.version}</small>
      </Link>
      <div>
        <Link href="/categories">Kategori</Link>
        <Link href="/about">Cara Main</Link>
      </div>
    </nav>
  );
}
function SiteFooter() {
  return (
    <footer className="site-footer">
      <p>
        Situs ini menggunakan analytics untuk memahami penggunaan dan
        memperbaiki permainan. <Link href="/privacy">Kebijakan Privasi</Link>
      </p>
      <p>
        © 2026 Nyaris Terkenal · Developed by{" "}
        <a href="https://prammmoe.space/" target="_blank" rel="noreferrer">
          Prammmoe
        </a>
      </p>
    </footer>
  );
}
function CategoryTile({ category }: { category: Category }) {
  return (
    <span
      aria-hidden="true"
      className={`category-tile ${categoryTone(category)}`}
    >
      {category.icon}
    </span>
  );
}
function CategoryCard({
  category,
  select,
}: {
  category: Category;
  select?: () => void;
}) {
  return (
    <button className="category-card" onClick={select}>
      <CategoryTile category={category} />
      <span className="category-copy">
        <h3>{category.title}</h3>
        <small>
          Sumber: {category.sourceLabel} · Snapshot: {category.dataAsOf}
        </small>
      </span>
    </button>
  );
}
function Setup({
  mode,
  onStart,
}: {
  mode: "quick" | "full";
  onStart: (game: Game) => void;
}) {
  const [names, setNames] = useState(["Pemain 1", "Pemain 2"]);
  const [rounds, setRounds] = useState(mode === "quick" ? 1 : 5);
  const [guesses, setGuesses] = useState(2);
  const [chosen, setChosen] = useState<Category[]>(
    mode === "quick" ? [categories[0]] : [],
  );
  const [reveal, setReveal] = useState(false);
  const [showRevealTip, setShowRevealTip] = useState(false);
  const updateName = (i: number, value: string) =>
    setNames(names.map((n, j) => (j === i ? value : n)));
  const start = () => {
    const teamNames = names.filter((n) => n.trim());
    if (!teamNames.length) return;
    const selected =
      mode === "quick"
        ? chosen.slice(0, 1)
        : selectRandomCategories(categories, chosen, rounds);
    const game = freshGame(mode, selected, teamNames, guesses, reveal);
    posthog.capture("game_started", {
      game_mode: mode,
      player_count: game.players.length,
      round_count: game.categories.length,
      guesses_per_player: guesses,
      reveal_answers: reveal,
    });
    onStart(game);
  };
  return (
    <main>
      <Nav />
      <section className="setup shell">
        <Link className="back" href="/">
          ← Kembali
        </Link>
        <h1>{mode === "quick" ? "Main sekarang." : "Main bareng."}</h1>
        <p className="lede">
          Rank tinggi = poin tinggi. Cari jawaban yang nyempil di ujung #100.
        </p>
        <div className="setup-grid">
          <div className="panel">
            <h2>Pemain</h2>
            {names.map((name, i) => (
              <label className="team-name" key={i}>
                <span style={{ background: colors[i] }}>{i + 1}</span>
                <input
                  aria-label={`Nama pemain ${i + 1}`}
                  value={name}
                  onChange={(e) => updateName(i, e.target.value)}
                />
                {names.length > 1 && (
                  <button
                    aria-label="Hapus pemain"
                    onClick={() => setNames(names.filter((_, j) => j !== i))}
                  >
                    ×
                  </button>
                )}
              </label>
            ))}
            {names.length < 7 && (
              <button
                className="text-button"
                onClick={() => setNames([...names, `Pemain ${names.length + 1}`])}
              >
                + Tambah pemain
              </button>
            )}
          </div>
          <div className="panel">
            <h2>Aturan</h2>
            {mode === "full" && (
              <label>
                Jumlah ronde{" "}
                <select
                  value={rounds}
                  onChange={(e) => setRounds(Number(e.target.value))}
                >
                  {[1, 3, 5, 7, 10].map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </label>
            )}
            <label>
              Tebakan per pemain{" "}
              <select
                value={guesses}
                onChange={(e) => setGuesses(Number(e.target.value))}
              >
                {[1, 2, 3, 5].map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </label>
            <div className="reveal-help">
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={reveal}
                  onChange={(e) => setReveal(e.target.checked)}
                />
                <span /> Buka daftar setelah ronde
              </label>
              <div className="mode-help">
                <button
                  className="mode-help-button"
                  type="button"
                  aria-label="Penjelasan buka daftar"
                  aria-expanded={showRevealTip}
                  onClick={() => setShowRevealTip((visible) => !visible)}
                >
                  i
                </button>
                {showRevealTip && (
                  <p className="mode-tip" role="tooltip">
                    Menampilkan semua jawaban dan rank setelah ronde selesai.
                    Tidak mengubah skor atau tebakan yang sudah masuk.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="choose">
          <div>
            <h2>
              {mode === "quick"
                ? "Pilih kategori"
                : `Pilih kategori (${chosen.length}/${rounds})`}
            </h2>
            <p>
              {mode === "full"
                ? "Sisa ronde akan dipilih secara acak, tanpa pengulangan."
                : "Satu kategori, satu ronde, langsung gas."}
            </p>
          </div>
          <div className="category-grid">
            {categories.map((c) => (
              <div
                key={c.id}
                className={chosen.some((x) => x.id === c.id) ? "selected" : ""}
              >
                <CategoryCard
                  category={c}
                  select={() =>
                    setChosen((prev) => {
                      const selected = !prev.some((x) => x.id === c.id);
                      posthog.capture("category_selected", {
                        category_id: c.id,
                        game_mode: mode,
                        selected,
                      });
                      if (!selected) return prev.filter((x) => x.id !== c.id);
                      if (mode === "quick") return [c];
                      return prev.length < rounds ? [...prev, c] : prev;
                    })
                  }
                />
              </div>
            ))}
          </div>
        </div>
        <button
          className="primary big"
          disabled={!names.filter(Boolean).length || !chosen.length}
          onClick={start}
        >
          Mulai Main →
        </button>
      </section>
      <SiteFooter />
    </main>
  );
}
function Result({ guess, close }: { guess: Guess; close: () => void }) {
  const valid = guess.valid && !guess.duplicate;
  const nearMiss = !valid && !!guess.nearMissRank;
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div
        className={`result-modal ${guess.rank && guess.rank >= 91 ? "fire" : ""}`}
      >
        <span className="kicker">
          {guess.duplicate
            ? "SUDAH DITEBAK"
            : valid
              ? "MASUK TOP 100"
              : nearMiss
                ? "NYARIS MASUK"
                : "NOT IN TOP 100"}
        </span>
        <h2>{guess.answerName || guess.input}</h2>
        {guess.duplicate ? (
          <p>
            Jawaban ini sudah dikunci pemain lain. Coba lagi—tebakanmu tidak
            terpakai.
          </p>
        ) : (
          <>
            <strong>
              {valid
                ? `#${guess.rank}`
                : nearMiss
                  ? `#${guess.nearMissRank}`
                  : "+0"}
            </strong>
            <b>{valid ? `+${guess.points} POIN` : nearMiss ? "+0 POIN" : ""}</b>
            <p>
              {nearMiss
                ? "Nyaris masuk Top 100. Tipis banget!"
                : pick(reactions(guess.rank, valid))}
            </p>
          </>
        )}
        <button className="primary" onClick={close}>
          Lanjut →
        </button>
      </div>
    </div>
  );
}
function Scoreboard({ players }: { players: Player[] }) {
  return (
    <aside className="scoreboard">
      <h3>Leaderboard</h3>
      {calculateLeaderboard(players).map((p, i) => (
        <div key={p.id}>
          <span>
            <em style={{ background: p.color }}>{i + 1}</em>
            {p.name}
          </span>
          <b>{p.score}</b>
        </div>
      ))}
    </aside>
  );
}
function Play({
  game,
  setGame,
}: {
  game: Game;
  setGame: (g: Game | null) => void;
}) {
  const [input, setInput] = useState("");
  const [last, setLast] = useState<Guess | null>(null);
  const category = game.categories[game.currentRound];
  const round = game.rounds[game.currentRound];
  const current = game.players[game.currentPlayerIndex];
  const submit = () => {
    if (!input.trim()) return;
    const response = submitGuess(game, input);
    const result = response.guess.duplicate
      ? "duplicate"
      : response.guess.valid
        ? "valid"
        : response.guess.nearMissRank
          ? "near_miss"
          : "invalid";
    posthog.capture("guess_submitted", {
      game_mode: game.mode,
      category_id: category.id,
      round_index: game.currentRound + 1,
      result,
      rank: response.guess.valid ? response.guess.rank : undefined,
      points: response.guess.points,
    });
    if (response.game.status === "round-result") {
      const completedRound = response.game.rounds[game.currentRound];
      posthog.capture("round_completed", {
        game_mode: game.mode,
        category_id: category.id,
        round_index: game.currentRound + 1,
        valid_guess_count: completedRound.guesses.filter((guess) => guess.valid)
          .length,
        total_points: completedRound.guesses.reduce(
          (total, guess) => total + guess.points,
          0,
        ),
      });
    }
    setGame(response.game);
    setInput("");
    setLast(response.guess);
  };
  const next = () => setLast(null);
  return (
    <main>
      <Nav />
      <section className="game shell">
        <div className="round-head">
          <span>
            RONDE {game.currentRound + 1} / {game.categories.length}
          </span>
          <button
            className="reset"
            onClick={() => {
              posthog.capture("game_reset", {
                game_mode: game.mode,
                round_index: game.currentRound + 1,
                game_status: game.status,
              });
              setGame(null);
            }}
          >
            Reset game
          </button>
        </div>
        <header className="category-title">
          <CategoryTile category={category} />
          <div>
            <h1>{category.title}</h1>
          </div>
        </header>
        <div className="play-grid">
          <div>
            <section className="turn-card">
              <span className="kicker">GILIRAN</span>
              <h2 style={{ color: current.color }}>{current.name}</h2>
              <p>
                {round.guesses.filter((g) => g.playerId === current.id).length}{" "}
                / {game.guessesPerPlayer} tebakan dipakai
              </p>
              <div className="guessbox">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  placeholder="Ketik jawaban..."
                  autoFocus
                />
                <button className="primary" onClick={submit}>
                  Tebak
                </button>
              </div>
              <small>
                Typo kecil dan nama singkat yang unik tetap bisa dikenali. Rank
                baru terlihat setelah submit.
              </small>
            </section>
            <section className="history">
              <h3>Tebakan ronde ini</h3>
              {round.guesses.length ? (
                round.guesses.map((g, i) => (
                  <div key={i}>
                    <span>
                      {game.players.find((p) => p.id === g.playerId)?.name}:{" "}
                      {g.answerName || g.input}
                    </span>
                    <b>
                      {g.valid
                        ? `#${g.rank} · +${g.points}`
                        : g.nearMissRank
                          ? `#${g.nearMissRank} · +0`
                          : "+0"}
                    </b>
                  </div>
                ))
              ) : (
                <p>Belum ada tebakan. Jangan pilih yang paling obvious.</p>
              )}
            </section>
          </div>
          <Scoreboard players={game.players} />
        </div>
      </section>
      {last && <Result guess={last} close={next} />}{" "}
      {game.status === "round-result" && !last && (
        <RoundEnd game={game} setGame={setGame} />
      )}
      <SiteFooter />
    </main>
  );
}
function RoundEnd({
  game,
  setGame,
}: {
  game: Game;
  setGame: (g: Game | null) => void;
}) {
  const round = game.rounds[game.currentRound];
  const category = game.categories[game.currentRound];
  const next = () => {
    if (game.currentRound + 1 >= game.categories.length) {
      posthog.capture("game_completed", {
        game_mode: game.mode,
        player_count: game.players.length,
        round_count: game.categories.length,
        highest_score: Math.max(...game.players.map((player) => player.score)),
        best_rank: Math.max(
          0,
          ...game.rounds.flatMap((round) =>
            round.guesses.filter((guess) => guess.valid).map((guess) => guess.rank || 0),
          ),
        ),
      });
      setGame({ ...game, status: "finished" });
    } else
      setGame({
        ...game,
        currentRound: game.currentRound + 1,
        currentPlayerIndex: 0,
        status: "playing",
      });
  };
  return (
    <div className="modal-backdrop">
      <div className="round-modal">
        <span className="kicker">ROUND COMPLETE</span>
        <h2>{category.shortTitle} selesai.</h2>
        <Scoreboard players={game.players} />
        {game.revealAnswers && (
          <details>
            <summary>Reveal daftar jawaban ({category.answers.length})</summary>
            <ol>
              {category.answers.map((a) => (
                <li
                  className={
                    round.guesses.some((g) => g.answerName === a.name)
                      ? "guessed"
                      : ""
                  }
                  key={a.name}
                >
                  <b>#{a.rank}</b> {a.name}
                </li>
              ))}
            </ol>
          </details>
        )}
        <button className="primary" onClick={next}>
          {game.currentRound + 1 >= game.categories.length
            ? "Lihat hasil akhir →"
            : "Ronde berikutnya →"}
        </button>
      </div>
    </div>
  );
}
function Final({
  game,
  setGame,
}: {
  game: Game;
  setGame: (g: Game | null) => void;
}) {
  const board = calculateLeaderboard(game.players);
  const best = game.rounds
    .flatMap((r) => r.guesses)
    .filter((g) => g.valid)
    .sort((a, b) => (b.rank || 0) - (a.rank || 0))[0];
  return (
    <main>
      <Nav />
      <section className="final shell">
        <span className="kicker">GAME OVER</span>
        <h1>Yang nyaris terkenal menang.</h1>
        <div className="podium">
          {board.map((p, i) => (
            <div key={p.id}>
              <span className="place">{["🥇", "🥈", "🥉"][i] || "🏅"}</span>
              <h2>{p.name}</h2>
              <strong>{p.score} pts</strong>
            </div>
          ))}
        </div>
        {best && (
          <div className="best">
            <span className="kicker">BEST GUESS</span>
            <h2>
              “{best.answerName}” <b>#{best.rank}</b>
            </h2>
            <p>
              {game.players.find((p) => p.id === best.playerId)?.name} menemukan
              jawaban paling tidak terduga.
            </p>
          </div>
        )}
        <div className="actions">
          <button className="primary" onClick={() => setGame(null)}>
            Main Lagi
          </button>
          <Link className="secondary" href="/">
            Home
          </Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
function AboutPage() {
  return (
    <main>
      <Nav />
      <section className="shell about">
        <span className="kicker">CARA MAIN</span>
        <h1>Tujuanmu bukan nomor satu.</h1>
        <div className="rule-grid">
          <article>
            <b>#1</b>
            <h2>+1 poin</h2>
            <p>Kepopuleran adalah musuh. Jawaban obvious itu jebakan.</p>
          </article>
          <article>
            <b>#94</b>
            <h2>+94 poin</h2>
            <p>Masuk tipis? Justru itu yang dicari.</p>
          </article>
          <article>
            <b>+0</b>
            <h2>Di luar Top 100</h2>
            <p>Jawaban tidak ada dalam daftar tidak menambah poin.</p>
          </article>
        </div>
        <p className="lede">
          Main bergiliran. Setiap jawaban yang sudah dipakai tidak bisa dinilai
          ulang. Rank adalah poin: semakin mendekati #100, semakin besar
          nilainya.
        </p>
        <section className="two-player-example" aria-labelledby="two-player-title">
          <span className="kicker">CONTOH 2 PEMAIN</span>
          <h2 id="two-player-title">Wiwi vs Wuwu, satu ronde</h2>
          <div>
            <article>
              <span>Giliran Wiwi</span>
              <b>KKN di Desa Penari · #1</b>
              <strong>+1 poin</strong>
            </article>
            <article>
              <span>Giliran Wuwu</span>
              <b>Jawaban tidak terduga · #94</b>
              <strong>+94 poin</strong>
            </article>
          </div>
          <p>
            Setelah ronde: <b>Wiwi 1</b> · <b>Wuwu 94</b>. Wuwu unggul karena
            jawabannya masih masuk Top 100, tetapi jauh lebih jarang.
          </p>
        </section>
        <section className="credits" aria-labelledby="credits-title">
          <span className="kicker">CREDITS</span>
          <h2 id="credits-title">Inspirasi dan referensi</h2>
          <p>
            Gameplay ini terinspirasi oleh{" "}
            <a
              href="https://play-barely-famous.vercel.app/"
              target="_blank"
              rel="noreferrer"
            >
              Barely Famous
            </a>
            .
          </p>
          <p>
            Terima kasih kepada{" "}
            <a href="https://sidemen.com/" target="_blank" rel="noreferrer">
              Sidemen
            </a>{" "}
            atas inspirasi format party-game.
          </p>
          <div className="video-credit">
            <iframe
              title="SIDEMEN TOP 100: 2025 EDITION"
              src="https://www.youtube-nocookie.com/embed/qcD8nbFwVfU"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
          <small>
            Nyaris Terkenal adalah adaptasi independen untuk pemain Indonesia;
            tidak berafiliasi dengan Barely Famous maupun Sidemen.
          </small>
        </section>
      </section>
      <SiteFooter />
    </main>
  );
}
function PrivacyPage() {
  return (
    <main>
      <Nav />
      <section className="shell privacy">
        <span className="kicker">KEBIJAKAN PRIVASI</span>
        <h1>Data yang kami gunakan, tanpa teka-teki.</h1>
        <p className="lede">Terakhir diperbarui: 13 September 2026.</p>
        <section>
          <h2>Ringkasnya</h2>
          <p>
            Nyaris Terkenal menggunakan PostHog untuk memahami jumlah kunjungan,
            cara permainan digunakan, performa situs, dan error teknis. Kami
            tidak sengaja mengirim nama pemain, isi jawaban, atau kata pencarian
            ke analytics.
          </p>
        </section>
        <section>
          <h2>Data yang dikumpulkan</h2>
          <p>
            PostHog dapat memproses identifier cookie atau sesi, halaman dan
            referrer, jenis perangkat dan browser, lokasi kasar yang diturunkan
            dari koneksi, waktu interaksi, metrik performa, serta detail error
            teknis. Kami juga mengirim data permainan berbentuk agregat seperti
            mode, jumlah pemain dan ronde, ID kategori, hasil tebakan, rank,
            dan skor.
          </p>
        </section>
        <section>
          <h2>Tujuan dan penyedia</h2>
          <p>
            Data dipakai untuk mengukur pengunjung, menemukan alur permainan
            yang perlu diperbaiki, menjaga performa, dan memperbaiki error.
            PostHog adalah penyedia analytics kami; data diproses melalui
            layanan PostHog Cloud di Amerika Serikat.
          </p>
        </section>
        <section>
          <h2>Pilihan dan hak Anda</h2>
          <p>
            Anda dapat membatasi cookie melalui pengaturan browser. Untuk
            pertanyaan, permintaan akses, koreksi, atau penghapusan data,
            hubungi Prammmoe melalui{" "}
            <a href="https://prammmoe.space/" target="_blank" rel="noreferrer">
              prammmoe.space
            </a>
            . Data disimpan sesuai pengaturan retensi PostHog dan selama
            diperlukan untuk tujuan di atas.
          </p>
        </section>
      </section>
      <SiteFooter />
    </main>
  );
}
export default function GameApp({
  page,
}: {
  page: "home" | "categories" | "about" | "privacy" | "quick" | "full";
}) {
  const [game, setGameState] = useState<Game | null>(null);
  const [showModeTip, setShowModeTip] = useState(false);
  const setGame = (g: Game | null) => {
    setGameState(g);
    if (g) localStorage.setItem("nyaris-terkenal-game", JSON.stringify(g));
    else localStorage.removeItem("nyaris-terkenal-game");
  };
  useEffect(() => {
    try {
      const saved = localStorage.getItem("nyaris-terkenal-game");
      if (saved) setGameState(JSON.parse(saved));
    } catch {
      localStorage.removeItem("nyaris-terkenal-game");
    }
  }, []);
  useEffect(() => {
    if (game)
      localStorage.setItem("nyaris-terkenal-game", JSON.stringify(game));
  }, [game]);
  if (game)
    return game.status === "finished" ? (
      <Final game={game} setGame={setGame} />
    ) : (
      <Play game={game} setGame={setGame} />
    );
  if (page === "quick" || page === "full")
    return (
      <Setup mode={page === "quick" ? "quick" : "full"} onStart={setGame} />
    );
  if (page === "categories")
    return (
      <main>
        <Nav />
        <section className="shell browser">
          <span className="kicker">KATEGORI</span>
          <h1>Pilih kategori yang seru</h1>
          <CategoryBrowser />
        </section>
        <SiteFooter />
      </main>
  );
  if (page === "about") return <AboutPage />;
  if (page === "privacy") return <PrivacyPage />;
  return (
    <main>
      <Nav />
      <section className="hero shell">
        <h1>
          Semakin nggak terkenal,
          <br />
          <i>semakin banyak poin.</i>
        </h1>
        <p>
          Tebak jawaban yang masih masuk Top 100. Peringkat #99 jauh lebih
          berharga daripada #1.
        </p>
        <div className="actions">
          <Link className="primary" href="/play/new">
            Main Bareng →
          </Link>
          <Link className="secondary" href="/play/quick">
            Quick Game
          </Link>
          <div className="mode-help">
            <button
              className="mode-help-button"
              type="button"
              aria-label="Penjelasan mode permainan"
              aria-expanded={showModeTip}
              onClick={() => setShowModeTip((visible) => !visible)}
            >
              i
            </button>
            {showModeTip && (
              <p className="mode-tip" role="tooltip">
                <b>Main Bareng</b> untuk beberapa ronde dan pemain.{" "}
                <b>Quick Game</b> untuk satu kategori, langsung mulai.
              </p>
            )}
          </div>
        </div>
        <div className="mechanic">
          <div>
            <span>KKN di Desa Penari</span>
            <b>#1</b>
            <strong>
              +1 poin <em>😵</em>
            </strong>
          </div>
          <div>
            <span>Jawaban mendekati #100</span>
            <b>#94</b>
            <strong>
              +94 poin <em>🔥</em>
            </strong>
          </div>
          <div>
            <span>Di luar daftar (lebih dari #100)</span>
            <b>—</b>
            <strong>
              +0 poin <em>💀</em>
            </strong>
          </div>
        </div>
      </section>
      <section className="shell intro">
        <h2>Pilih Kategori</h2>
        <div className="category-grid">
          {categories.slice(0, 3).map((c) => (
            <CategoryCard category={c} key={c.id} />
          ))}
        </div>
        <Link className="text-button" href="/categories">
          Lihat semua kategori →
        </Link>
      </section>
      <SiteFooter />
    </main>
  );
}
function CategoryBrowser() {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("Semua");
  const filtered = useMemo(
    () =>
      categories.filter(
        (c) =>
          (tag === "Semua" || c.tags.includes(tag)) &&
          c.title.toLowerCase().includes(query.toLowerCase()),
      ),
    [query, tag],
  );
  return (
    <>
      <input
        className="search"
        placeholder="Cari kategori..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="chips">
        {allTags.map((t) => (
          <button
            className={tag === t ? "active" : ""}
          onClick={() => {
            if (tag !== t) posthog.capture("category_filter_used", { tag: t });
            setTag(t);
          }}
            key={t}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="category-grid">
        {filtered.map((c) => (
          <CategoryCard category={c} key={c.id} />
        ))}
      </div>
      {!filtered.length && (
        <p>Tidak ada kategori yang cocok. Coba kata lain.</p>
      )}
    </>
  );
}
