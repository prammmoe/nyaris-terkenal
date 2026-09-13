# Smart String Matching Implementation Notes

Branch: `unbranched workspace`

## 2026-09-13 - Remove autocomplete and add tolerant matching

### Changed

- Replaced suggestion-based input with deterministic local matching for punctuation, aliases, small typos, and unambiguous name tokens.
- Added optional category near-miss answers (#101–110), including a non-scoring rank hint in game results.
- Added `Maliq & D'Essentials` aliases and matcher/near-miss coverage.
- Added credits on the Cara Main page for Barely Famous and Sidemen, with an independent-adaptation disclaimer.
- Embedded the cited MoreSidemen Top 100 video in the credits card using YouTube's privacy-enhanced player.
- Simplified category cards to their visual icon and title only.
- Added a compact home-page tip explaining the difference between Main Bareng and Quick Game.
- Replaced the mountain category's placeholder ordering with the first 100 unique height-ranked entries from Data Gunung, including height values and the `Puncak Jaya` alias.
- Added five source-labelled categories with 25 ranked entries each, taking the category pool to 15 while keeping the 10-round game cap.
- Removed category tag and filler subtitle from the active-game header, leaving the icon and title as the only category context during play.
- Added non-clickable source and snapshot credits to category cards, plus source metadata validation for all 15 local datasets.
- Added an accessible info tooltip beside the answer-reveal option in game setup.
- Reduced that setup-only info button to a compact 25px circle without changing the home-page mode tip.
- Unified Home score cards and About rule cards into white, button-like surfaces with coloured lower-edge accents.
- Simplified those cards further into solid game-button colours with white primary text and darker lower edges.
- Expanded Cara Main with a two-player scoring example that demonstrates why a #94 answer beats a #1 answer.
- Replaced remaining “obscure” UI copy with Indonesian phrasing.
- Renamed the two-player Cara Main example to Wiwi and Wuwu.
- Released manifest and visible navigation label as v1.2.0.
- Added a self-hosted Open Graph image route and share metadata for link previews.

### Stayed The Same

- Rankings, score calculation, turn rotation, and duplicate-answer behavior remain local and deterministic.

### Verification

- `npm run validate:data`, `npm test`, and `npm run build`.
- Category expansion: `npm run validate:data`, `npm test`, and `npm run build` passed with 15 categories and 10 unique round selection coverage.
