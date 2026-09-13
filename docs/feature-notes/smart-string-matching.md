# Smart String Matching Implementation Notes

Branch: `unbranched workspace`

## 2026-09-13 - Remove autocomplete and add tolerant matching

### Changed

- Replaced suggestion-based input with deterministic local matching for punctuation, aliases, small typos, and unambiguous name tokens.
- Added optional category near-miss answers (#101–110), including a non-scoring rank hint in game results.
- Added `Maliq & D'Essentials` aliases and matcher/near-miss coverage.
- Added credits on the Cara Main page for Barely Famous and Sidemen, with an independent-adaptation disclaimer.
- Embedded the cited MoreSidemen Top 100 video in the credits card using YouTube's privacy-enhanced player.

### Stayed The Same

- Rankings, score calculation, turn rotation, and duplicate-answer behavior remain local and deterministic.

### Verification

- `npm run validate:data`, `npm test`, and `npm run build`.
