import { categories } from "../lib/data";
import { normalizeAnswer } from "../lib/game";

let errors = 0;
if (categories.length !== 15) { console.error(`expected 15 categories, found ${categories.length}`); errors++; }
for (const category of categories) {
  if (!category.sourceUrl || category.sourceLabel === "Dataset kurasi" || !/^(2025|2026)/.test(category.dataAsOf) || category.answers.length < 25) {
    console.error(`${category.id}: missing source metadata or fewer than 25 answers`); errors++;
  }
  const ranks = new Set<number>(), names = new Set<string>();
  const validate = (answer: { name: string; rank: number; aliases?: string[] }, min: number, max: number, label: string) => {
    const values = [answer.name, ...(answer.aliases || [])].map(normalizeAnswer);
    if (!answer.name || answer.rank < min || answer.rank > max || ranks.has(answer.rank) || values.some(value => names.has(value))) {
      console.error(`${category.id}: invalid or duplicate ${label} ${answer.name} (#${answer.rank})`); errors++;
    }
    ranks.add(answer.rank); values.forEach(value => names.add(value));
  };
  category.answers.forEach(answer => validate(answer, 1, 100, "answer"));
  category.nearMisses?.forEach(answer => validate(answer, 101, 110, "near miss"));
}
if (errors) process.exit(1);
console.log(`✓ ${categories.length} categories valid`);
