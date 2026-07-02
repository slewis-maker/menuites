# Bridge — Roadmap

Running list of what's shipped, what's queued, and the strategic parks.
Update as decisions get made and threads close.

Code lives at `/Users/macmini/Desktop/Quohort/food_bridging/`. This file lives in the Bridge project folder so it travels with the conversation.

---

## SHIPPED — current capabilities

- **Core data layer** — 910 ingredients with FlavorDB chemistry, ~30 cuisines, 232k+ recipes
- **Three-axis scoring** (`scripts/pair.py`) — recipe / flavor / chemistry compatibility per pair, with percentile ranks and equal-weighted composite
- **Bridging mode** (`scripts/bridge.py`) — find chemistry-strong, recipe-rare pairs in a target cuisine; multiple sort axes
- **NOT IN (NULL) bug patched** — bridge.py no longer silently returns empty for non-composite targets
- **Composite-aware decomposition** (`scripts/load_compositions.py`) — 44 prepared foods (Ice cream, Pudding, Pizza, Cake, Bread, Pasta, Mayonnaise, Ketchup, Rice Pudding, etc.) decomposed into components with proportions
- **Composite synthesis** (`scripts/synthesize_composites.py`) — sparse composites auto-inherit descriptor/compound profiles from components (Ice cream went from 12 → 425 descriptors)
- **Dish-level bridging** — pair queries and bridge queries now work on prepared foods, not just raw ingredients
- **Compatibility graphic** — three-bar + composite card format for visualizing per-pair / per-recipe scores

---

## v1.1 — QUEUED (high-leverage, low-cost fixes)

- **Recipe-axis PMI/lift** — replace count-based percentile with observed-vs-expected co-occurrence. Current axis compresses at the bottom (any zero-count pair gets P50) and at the top (anything in 10k+ recipes hits P99). PMI fixes both.
- **Recompute descriptor IDF post-synthesis** — `build_descriptor_idf.py` was run on the pre-synthesis corpus. Adding ~13k descriptor rows shifted document frequency. IDF values are slightly stale.
- **Baseline overlap as secondary chemistry score** — current top-K signature approach misses shared-but-non-distinctive overlap (the Pizza × Pasta problem where shared flour-derived descriptors aren't captured). Add a Jaccard or full-set overlap as a secondary signal.
- **Candidate-quality filter** — exclude noisy entities like "Beef Processed" or "Fried Potato" that top bridge results via diffuse Maillard mass rather than real chemistry. Either category blacklist or per-ingredient quality score.
- **Ingredient alias / dedup audit** — Filbert and Hazelnut are the same nut but score completely differently due to data coverage gaps. Likely other duplicates lurk. Audit `ingredient_aliases` table.

---

## v1.5 — PRODUCT EXTENSIONS (if/when the app exists)

- **Menu library** — save scanned menus, build personal corpus. Data moat, switching cost, search.
- **Behavioral preference inference** — infer taste preferences from what user ordered / saved / returned to, not from explicit ratings. Explicit-rating products fail; behavior-derived signal works.

---

## v2 — ARCHITECTURAL EXPANSIONS (cooking-state and texture)

### State-of-cooking awareness
The model captures *static* compatibility but is silent on cooking transformations. The Caesar+corn test empirically validated this: corn × anchovy chemistry shifts from P8 (raw) to P61 (roasted/Maillard) when we substitute Popcorn for Sweetcorn. Three architectural options, ranked by feasibility:

1. **Easy lift — extend entity layer.** Add cooking-state variants: "Corn, raw / boiled / charred / popped" each with own compound profile. FlavorDB partially does this. Systematic coverage of major ingredients × major prep methods. Labor-real, difficulty-low, gets 70% of the value.
2. **Medium lift — model the transforms.** Build `cooking_transforms` table mapping (input compound × method × temp × time) → output compound delta. Maillard chemistry is well-characterized (Belitz, McGee, Coultate). Composable, generative.
3. **Hard lift — texture as orthogonal axis.** Texture lives outside volatile chemistry — in physical state (water content, starch gelatinization, fat distribution, protein structure). Each ingredient × prep state needs a texture vector. Plus the interaction layer (contrast theory: crunchy + creamy outperforms crunchy + crunchy). Parallel dataset.

**Pick: A → C → B.** Entity variants first (lowest cost), texture second (highest defensibility), transforms third (most elegant but most data-intensive).

### Mood-based recommendation
- **"Light and garlicky"** fuzzy intent parsing — maps natural-language vibe → descriptor/compound space → menu options ranked by user-weighted compatibility
- Requires v2 personalization layer (behavioral preferences) to be useful

---

## v3+ — FAR FUTURE

- **Temperature-volatility tags** on compounds (some compounds only perceived at high temp)
- **Dish-as-composite** — recipe is the unit of analysis, not just the ingredient list
- **Cross-cuisine fusion engine** — auto-generate dishes that bridge two specified cuisines

---

## STRATEGIC PARKS — revisit when relevant

### The product reposition (40+ secret-purpose play)
- Menu-scanner app where chemistry insight is social cover for menu magnification
- Solves presbyopia / dignity preservation under cover of curiosity tool
- 10x TAM vs food-curious-millennial niche
- Higher pricing power ($9-15/mo vs $5/mo)
- Daily-use vs occasional-use retention
- Competitive risk: Apple/Google ship OS-level menu vision in 2-3 years — chemistry is the moat

### Validation thread (cheapest move first)
- **$5K wizard-of-oz**: Figma + working flow + 3 hand-processed real menus
- 30 users aged 42-58, regular restaurant-goers
- Measure: do they keep using it past third use, do they share, do they pay $5-15/mo
- Core question: **chemistry or magnification driving daily use?**
- This answer determines everything downstream — has not been done yet

### GTM thread
- 40+ demo does NOT move on TikTok; over-indexes on print, podcasts, Substack, dinner conversation, Instagram
- Founder-brand leverage: Steven personally telling the story carries more weight than a hidden-team app
- Press narrative: "built for chefs, realized it solved a daily problem for 40+ America" — food media + tech press
- Audience map (specific publications, channels, first 100 users) — open

### Build cost estimates (when ready)
- Solo + AI tools (Cursor/Claude Code): $15–40K, 18–24 months, evenings/weekends
- Solo + offshore contractor: $20–60K, 4–8 months
- US freelancer build: $60–150K, 4–6 months
- Agency build: $120–300K, 4–6 months
- Tech co-founder for equity: $10–40K cash, 6–9 months calendar

---

## DATA HYGIENE — known issues

- Filbert / Hazelnut treated as separate entities; likely other duplicates
- Cream, Paprika, several cheeses are data-sparse stubs (5-13 compounds)
- "Olive" stands in for olive oil (no dedicated olive oil entity)
- Worcestershire, chipotle, tomato paste, scallion not in DB
- IDF table is pre-synthesis (slightly stale)
- "Sausage" decomposition is missing "Spice" component

---

## POSITIONING — current language

- **Marketing line**: "Bridge — the chemistry behind your pairings"
- **Frame**: decision support, not discovery
- **Not**: "find what cookbooks missed" (Western cuisines have already done that work; East Asian intentionally pair-contrast; the discovery frame doesn't hold up)
- **Yes**: "understand what you're already doing" — chef's lens / second opinion / informed pairings

---

*Last updated: during the session that built the three-axis backbone, added composite decomposition, and unlocked the 40+ reposition.*
