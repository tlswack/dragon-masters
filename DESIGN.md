# Dragon Masters — Game Design & Build Bible

> **How to use this file.** Save it in your project folder as `DESIGN.md`. It's written to be read by both you *and* Claude Code — when you start a build session, you can tell Claude Code "read DESIGN.md" so it always has the full picture. You don't need to understand every technical section; the parts you'll live in are the design chapters (1–9) and the roadmap (chapter 13).

---

## 1. Vision & Pillars

Dragon Masters is a turn-based tactical game where the child commands massive dragons, and **math is how you channel power** — not a quiz bolted onto a game, but the actual engine of the action economy. Every attack, every capture, every base upgrade is paid for by solving math.

Three pillars hold the whole design up:

1. **Math is agency, never a gate.** Solving a harder problem *unlocks a bigger tactical option*, so the child chooses to stretch because it helps them win — not because they're told to.
2. **Difficulty follows the child.** "Hard" for an 8-year-old and a 10-year-old are different. The game tracks each child's mastery and always serves problems at the edge of what they can do.
3. **Failure is soft.** Wrong answers cost a turn or some power, never progress. Losing a battle means retreat, never permadeath. The child should always feel safe to try.

**Target player:** ages 8–10 core, with an adaptive range that quietly reaches down to ~6 and up to ~12.
**Platform:** responsive web, mobile-first (phone and iPad primary), touch-first, playable offline, later installable to the home screen.

---

## 2. The Adaptive Math Engine *(the heart of the game)*

This is the single most important system and the one your original doc left open. Everything else is scaffolding around it.

### 2.1 The skill graph
Math is modeled as a graph of small **skills**, each a node with prerequisites:

```
add_within_20 → add_2digit → add_3digit
sub_within_20 → sub_2digit (borrowing) → sub_3digit
mult_tables (2–5) → mult_tables (6–9) → mult_2x1digit → mult_2x2digit
div_basic → div_remainder → div_long
area_rectangle → area_composite
volume_box
fractions_intro → fractions_compare
```

A skill **unlocks** when its prerequisites are roughly mastered. This graph doubles as the game's progression map (see chapter 8) — regions of the world map onto bands of this graph.

### 2.2 Mastery tracking
For each skill the game keeps a **mastery score from 0 to 1**, updated after every answer:

- Correct answer nudges the score up; wrong nudges it down (gently).
- Answering *fast* nudges a little more than answering slowly (fluency matters, but never punish slow-and-correct).
- Use a rolling/decaying average so recent performance matters most and unused skills fade slightly, prompting review.

A skill is **"mastering"** around 0.5–0.85 and **"mastered"** above ~0.85.

### 2.3 Problem selection (the zone of proximal development)
When the game needs a problem, it picks:

- **~70%** from skills currently *mastering* (0.5–0.85) — the productive struggle zone.
- **~20%** review from *mastered* skills — keeps fluency sharp.
- **~10%** a stretch into a just-unlocked skill — the "reach."

This is what keeps an 8-year-old and a 10-year-old both engaged with the same game.

### 2.4 Reward scaling (the clever part)
In combat the child chooses a **Focus tier** — Quick, Medium, or Heavy — and the game fills that tier from *their own current frontier*:

| Tier | Aether | Pulled from |
|------|--------|-------------|
| Quick Strike | 1 | an easy, near-mastered skill (fast dopamine) |
| Medium Focus | 3 | a mastering skill |
| Heavy Focus | 5 | the child's hardest available skill (or a multi-step problem) |

So "Heavy Focus = 5 Aether" is always *genuinely hard for that specific child*. The absolute difficulty rises invisibly as the child grows, but the game-feel ("the hard one gives me the big move") stays constant.

### 2.5 Gentle failure
- Wrong answer in combat → **no Aether this beat**, and the enemy gets its turn. That's the whole penalty.
- The same skill returns soon after, sometimes with a hint, so the miss becomes a learning moment.
- Mastery never crashes from one miss; it decays slowly.

---

## 3. Combat System

Turn-based, on a small battlefield with an **elevation axis** and a **lineage/aspect** matchup layered on top.

### 3.1 Elevation zones
Three zones stacked vertically: **Ground**, **Low Air**, **High Air** (plus **Underground** and **Water** for certain lineages). A dragon can only make physical attacks against targets it can reach.

The core tactical hook: **a Ground-locked Drake cannot physically hit a Celestial sitting in High Air.** The Drake must either use a ranged Aspect attack or spend Aether to *force the Celestial to land* — and forcing the shift costs a Heavy problem. Positioning turns math into strategy.

### 3.2 Lineages and where they can go
| Lineage | Zones | Identity |
|---------|-------|----------|
| Wyvern | Ground, Low Air, High Air | Fast aerial skirmisher; fragile grounded |
| Drake | Ground only | Heavy tank; immune to being forced to land; can't hit High Air physically |
| Wyrm | Ground, Underground | Stealth/positioning via burrow |
| Leviathan | Ground, Water | Controls water battlefields |
| Sovereign | Ground, Low Air (slow to High Air) | Armored dreadnought; slow elevation |
| Celestial | Low Air, High Air (levitates) | Can't be "wing-clipped"; alters weather on deploy |

### 3.3 Aspect effectiveness ring
Six aspects in a clean, learnable cycle — **each is strong against the next**, weak against the previous:

```
Inferno → Frost → Blight → Aether → Tempest → Terra → (back to Inferno)
```

Read it as: Inferno melts Frost, Frost halts Blight, Blight corrodes Aether, Aether calms Tempest, Tempest erodes Terra, Terra smothers Inferno. Strong hits do ~1.5×, weak hits ~0.5×. A single ring is easy for a kid to internalize.

### 3.4 The Aether economy (starting numbers to tune)
| Action | Aether cost |
|--------|-------------|
| Physical bite/claw | 1 |
| Aspect (elemental) attack | 3–5 |
| Elevation shift (self up, or force enemy down) | 3 |
| Special / signature move | 5 |

Aether is earned only by solving problems (chapter 2.4). Unspent Aether can carry a small amount between turns, so banking toward a big move is a real choice.

### 3.5 Loss states
When a dragon's HP hits zero it is **exhausted** (not dead) and retreats. If the whole party is exhausted, the battle is lost and the player returns to the last safe point with everything intact. Retry is always one tap away.

---

## 4. Capture — The Tethering Ritual

Capturing is a two-step act of skill, not a lucky throw.

1. **Break the Will.** Reduce the wild dragon's "Will" meter through combat (damage chips at it). You can't tether a dragon at full Will.
2. **The Ritual.** Once Will breaks, a timed sequence of **scaling math problems** appears — each correct answer tightens an Aether Tether one link. Miss too many before time runs out and the dragon breaks free (and you can try again). Tougher/rarer dragons demand longer or harder sequences.

Captured dragons go to your **Hoard** (chapter 7).

---

## 5. Progression — Molting

Life stages: **Hatchling → Fledgling → Apex → Elder.**

A dragon that reaches a combat threshold enters a **Molt**. To complete it and advance a stage, the player must both:
- provide **catalysts** (specific materials gathered from battles/quests), and
- meet an **infrastructure prerequisite** in the Hoard (chapter 7) — e.g., a Leviathan can't reach Apex until its pool is large enough.

Molting is deliberately slow and resource-driven, so growth feels earned.

---

## 6. Weather & Battlefield Modifiers *(light layer, add later)*

Celestials alter weather on deployment; some regions have standing conditions (a storm boosts Tempest, dims Inferno). Keep this simple at first — one or two modifiers — and expand once the core loop is fun.

---

## 7. The Hoard — Base Building & Applied Math

The Hoard is home base and the place where math shifts from fast arithmetic to **applied problem-solving and geometry**.

- **Resources** come as raw numbers in inventory: Adamantine, Aqua-glass, Brimstone, plus a couple more (e.g., Emberwood, Skyglass).
- **The Architect's Desk** converts raw materials into upgrades via applied problems:
  > *"You have 50 Adamantine. A reinforced Sovereign pen needs 15 per wall. How many walls can you build, and what's the remainder?"*
- **Habitat prerequisites** gate high-tier dragons: a Celestial needs a High-Altitude Roost; a Leviathan needs a pool of a certain **volume** (teaching area/volume). This is where geometry lives.
- **Passive benefits** reward good base-building: a Fledgling resting in a fully upgraded Roost might start its next battle with **+2 Aether pre-loaded**.

---

## 8. World Structure & Campaign *(new — turns systems into a game)*

The world is a series of **regions**, each themed to a lineage/aspect **and** a band of the skill graph, so moving through the world *is* moving through the curriculum:

1. **Emberreach Foothills** — intro region. Terra/Inferno dragons. Skills: addition & subtraction fluency. Boss: a Terra-Drake.
2. **Stormspire Cliffs** — Tempest/Wyvern. Skills: multiplication tables. Boss: a Tempest-Wyvern that flees to High Air (teaches elevation).
3. **Frostdeep Tundra** — Frost/Wyrm. Skills: division with remainders. Boss: a burrowing Frost-Wyrm.
4. **Aether Vault (Celestial)** — capstone. Applied math (area/volume) + mixed review. Boss: a Celestial that alters weather.

Each region is a short sequence of bite-sized battles (5–10 minutes each) ending in a boss you can only tether once the region's skills are mastering. New regions unlock as skills unlock — progression and learning are the same axis.

---

## 9. Meta: Sessions, Onboarding, and the Parent Layer

- **Session shape:** each battle is 5–10 minutes so a play session fits a kid's attention and a car ride. The overworld is the hub between battles.
- **Onboarding:** the first battle is a guided tutorial — one Wyvern, one enemy, one problem at a time, teaching Focus tiers and one attack before adding elevation.
- **Parent/Teacher dashboard** *(strong differentiator, cheap to build because the mastery model already produces the data):* a simple screen showing which skills are mastered, which are shaky, time played, and a difficulty nudge (bias easier / on-level / harder). No accounts needed for v1 — it's just another screen.

---

## 10. Starter Content Set *(so the build has something concrete)*

**Three dragons for the first playable slice:**

- **Cinderling** — Hatchling, Inferno-Wyvern. Zones: Ground/Low Air/High Air. Moves: *Ember Bite* (physical, 1), *Cinder Breath* (Inferno aspect, 3). Molts into **Pyrewing** (Fledgling).
- **Boulderback** — Hatchling, Terra-Drake. Zones: Ground only. Moves: *Rock Slam* (physical, 1), *Stone Spray* (Terra aspect, 3). Tanky, slow.
- **Zephyrix** — Fledgling, Tempest-Celestial. Zones: Low/High Air. Moves: *Gale Slash* (physical, 1, air only), *Storm Surge* (Tempest aspect, 5), *Fogbank* (utility — hides in High Air). The tutorial boss that teaches "force it to land."

**Materials:** Adamantine, Aqua-glass, Brimstone, Emberwood, Skyglass.

**First region:** Emberreach Foothills — three battles + a Terra-Drake boss.

This is enough to build Phases 1–4 of the roadmap.

---

## 11. Data Model *(why the game will be easy to expand)*

**Golden rule: content lives in config, not code.** Dragons, moves, aspects, materials, skills, and regions are all data files. Adding a new dragon means adding an entry, not writing new logic. This is what lets the game grow forever and what makes it pleasant to build with Claude Code.

```
/src/data/
  dragons.ts     // species: id, name, lineage, aspect, baseStats, moves[], zones[], moltInto, catalysts[]
  moves.ts       // id, name, kind (physical|aspect|utility), aetherCost, power, targetZones[], effect
  aspects.ts     // the effectiveness ring + multipliers
  lineages.ts    // allowed elevation zones + traits per lineage
  materials.ts   // id, name
  skills.ts      // the math skill graph: id, name, prereqs[], generate() → {prompt, answer}
  regions.ts     // campaign: ordered battles, required skills, boss
```

**Save state** (one JSON blob in the browser's local storage — no server, no login):
```
player: { roster: DragonInstance[], hoard: {materials, buildings}, mastery: {skillId → 0..1}, progress }
```

---

## 12. Tech Choices *(decided, beginner-friendly)*

- **Framework:** React + TypeScript, built with **Vite**. Fast, simple, the format Claude Code handles most reliably.
- **Styling:** **Tailwind CSS** — mobile-first by default, and very easy for Claude Code to work with. Big touch targets, responsive layouts, no separate CSS files to juggle.
- **Battlefield:** plain HTML/CSS (flexbox/grid), **not** a game engine or canvas. Because the game is turn-based, we don't need a real-time loop — this keeps everything simple and touch-friendly.
- **Game state:** **Zustand** (a tiny, beginner-friendly state library) or React's built-in reducer.
- **Saving:** the browser's local storage — works offline, no accounts, perfect for a tablet game.
- **Later polish:** Framer Motion for animation juice; a PWA manifest so it installs to the iPad home screen like a real app.
- **No backend, no database, no login for v1.** Everything runs on-device.

---

## 13. Build Roadmap *(each phase is playable and testable on your phone)*

Build in thin vertical slices. After each phase you run the app and actually play the new piece before moving on. Tell Claude Code to tackle **one phase at a time**.

- **Phase 0 — Setup.** Create the Vite + React + TypeScript + Tailwind project, get a "hello dragon" screen running, and drop this file in as `DESIGN.md`. *Success: the blank app opens in your browser and on your phone.*
- **Phase 1 — The Focus Board.** A standalone screen: math problems appear, you tap an answer, an Aether counter goes up. No combat yet. *Success: solving problems feels good and the counter works.*
- **Phase 2 — First battle.** Cinderling vs Boulderback. Turn-based: earn Aether from the Focus Board, spend it on Bite / Aspect / (later) Elevation, HP bars, win/lose. *Success: you can win a fight by doing math.*
- **Phase 3 — The adaptive engine.** Add mastery tracking, zone-of-proximal-development problem selection, and reward scaling. *Success: problems get harder as you improve; the parent nudge changes difficulty.*
- **Phase 4 — Capture.** Break Will, run the Tethering ritual, add the captured dragon to your roster. *Success: you can catch Boulderback and use it next battle.*
- **Phase 5 — Hoard & molting.** The base screen, Architect's Desk applied-math upgrades, and molting a Hatchling to Fledgling. *Success: you can build a pen and evolve a dragon.*
- **Phase 6 — Overworld & campaign.** The Emberreach Foothills region: a map, three battles, and the boss. *Success: a real "start to finish" mini-campaign.*
- **Phase 7 — Polish.** Parent dashboard, animations, sound, and the PWA install. *Success: it installs on the iPad and feels like a finished game.*

---

## 14. Open Design Questions to Revisit Later

- Exact balance numbers (HP pools, Aether carryover, tether timers) — tune by playtesting with a real kid.
- How many dragons ship in v1 vs. added over time.
- Whether to add a light story wrapper or keep it purely gameplay-driven.
- Multiplayer / friend battles — deliberately out of scope for v1.
