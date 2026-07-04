import { randInt, pick, shuffle } from "../engine/rng";

// A math problem ready to show on screen. Answers are strings so fraction
// problems ("1/2") and number problems ("42") share one shape.
export interface Problem {
  skillId: string;
  prompt: string;
  answer: string;
  choices: string[];
  hint: string;
}

export interface Skill {
  id: string;
  name: string;
  // Skills unlock when every prerequisite is roughly mastered (see engine/mastery.ts).
  prereqs: string[];
  // Rough curriculum band 1-4; regions map onto these bands (DESIGN.md ch. 8).
  band: 1 | 2 | 3 | 4;
  generate: () => Problem;
}

// Builds a 4-option multiple choice set. Distractors that collide with the
// answer or each other are replaced by nearby numbers so choices stay unique.
function numberChoices(answer: number, rawDistractors: number[]): string[] {
  const seen = new Set<number>([answer]);
  const distractors: number[] = [];
  for (const d of rawDistractors) {
    let candidate = Math.max(0, Math.round(d));
    while (seen.has(candidate)) candidate += 1;
    seen.add(candidate);
    distractors.push(candidate);
    if (distractors.length === 3) break;
  }
  while (distractors.length < 3) {
    let candidate = Math.max(0, answer + randInt(1, 9));
    while (seen.has(candidate)) candidate += 1;
    seen.add(candidate);
    distractors.push(candidate);
  }
  return shuffle([answer, ...distractors].map(String));
}

function problem(skillId: string, prompt: string, answer: number, distractors: number[], hint: string): Problem {
  return { skillId, prompt, answer: String(answer), choices: numberChoices(answer, distractors), hint };
}

export const SKILLS: Skill[] = [
  {
    id: "add_within_20",
    name: "Adding to 20",
    prereqs: [],
    band: 1,
    generate() {
      const a = randInt(2, 12);
      const b = randInt(2, Math.min(19 - a, 9) + 1);
      const ans = a + b;
      return problem(this.id, `${a} + ${b} = ?`, ans, [ans - 1, ans + 1, ans + 2], "Try counting up from the bigger number.");
    },
  },
  {
    id: "sub_within_20",
    name: "Subtracting to 20",
    prereqs: [],
    band: 1,
    generate() {
      const a = randInt(6, 20);
      const b = randInt(2, a - 1);
      const ans = a - b;
      return problem(this.id, `${a} − ${b} = ?`, ans, [ans + 1, ans - 1, ans + 2], "Count back, or think: what plus " + b + " makes " + a + "?");
    },
  },
  {
    id: "add_2digit",
    name: "Adding 2-digit numbers",
    prereqs: ["add_within_20"],
    band: 1,
    generate() {
      const a = randInt(13, 89);
      const b = randInt(12, 99 - a > 12 ? 99 - a : 12);
      const ans = a + b;
      return problem(this.id, `${a} + ${b} = ?`, ans, [ans + 10, ans - 10, ans + 1], "Add the tens first, then the ones.");
    },
  },
  {
    id: "sub_2digit",
    name: "Subtracting 2-digit numbers",
    prereqs: ["sub_within_20"],
    band: 1,
    generate() {
      const a = randInt(30, 99);
      const b = randInt(11, a - 10);
      const ans = a - b;
      return problem(this.id, `${a} − ${b} = ?`, ans, [ans + 10, ans - 10, ans + 1], "Take away the tens first, then the ones.");
    },
  },
  {
    id: "add_3digit",
    name: "Adding 3-digit numbers",
    prereqs: ["add_2digit"],
    band: 2,
    generate() {
      const a = randInt(110, 750);
      const b = randInt(110, 999 - a > 110 ? 999 - a : 110);
      const ans = a + b;
      return problem(this.id, `${a} + ${b} = ?`, ans, [ans + 100, ans - 10, ans + 10], "Hundreds, then tens, then ones.");
    },
  },
  {
    id: "sub_3digit",
    name: "Subtracting 3-digit numbers",
    prereqs: ["sub_2digit"],
    band: 2,
    generate() {
      const a = randInt(300, 999);
      const b = randInt(110, a - 100);
      const ans = a - b;
      return problem(this.id, `${a} − ${b} = ?`, ans, [ans + 100, ans - 100, ans + 10], "Hundreds, then tens, then ones.");
    },
  },
  {
    id: "mult_tables_2_5",
    name: "Times tables (2–5)",
    prereqs: ["add_within_20"],
    band: 2,
    generate() {
      const a = randInt(2, 5);
      const b = randInt(2, 10);
      const ans = a * b;
      return problem(this.id, `${a} × ${b} = ?`, ans, [ans + a, ans - a, ans + b], `${a} × ${b} is ${b} added together ${a} times.`);
    },
  },
  {
    id: "mult_tables_6_9",
    name: "Times tables (6–9)",
    prereqs: ["mult_tables_2_5"],
    band: 2,
    generate() {
      const a = randInt(6, 9);
      const b = randInt(2, 10);
      const ans = a * b;
      return problem(this.id, `${a} × ${b} = ?`, ans, [ans + a, ans - a, ans + b], `Try (${a} × ${b - 1}) + ${a}.`);
    },
  },
  {
    id: "mult_2x1digit",
    name: "Multiplying 2-digit × 1-digit",
    prereqs: ["mult_tables_6_9"],
    band: 3,
    generate() {
      const a = randInt(12, 49);
      const b = randInt(3, 9);
      const ans = a * b;
      const tens = Math.floor(a / 10) * 10;
      return problem(this.id, `${a} × ${b} = ?`, ans, [ans + b, ans - b, tens * b], `Split it: (${tens} × ${b}) + (${a - tens} × ${b}).`);
    },
  },
  {
    id: "mult_2x2digit",
    name: "Multiplying 2-digit × 2-digit",
    prereqs: ["mult_2x1digit"],
    band: 4,
    generate() {
      const a = randInt(11, 25);
      const b = randInt(11, 19);
      const ans = a * b;
      return problem(this.id, `${a} × ${b} = ?`, ans, [ans + a, ans - b, ans + 10], `Split it: (${a} × 10) + (${a} × ${b - 10}).`);
    },
  },
  {
    id: "div_basic",
    name: "Division facts",
    prereqs: ["mult_tables_2_5"],
    band: 3,
    generate() {
      const b = randInt(2, 9);
      const ans = randInt(2, 10);
      const a = b * ans;
      return problem(this.id, `${a} ÷ ${b} = ?`, ans, [ans + 1, ans - 1, ans + 2], `Think: ${b} times what makes ${a}?`);
    },
  },
  {
    id: "div_remainder",
    name: "Division with remainders",
    prereqs: ["div_basic"],
    band: 3,
    generate() {
      const b = randInt(3, 9);
      const q = randInt(3, 9);
      const r = randInt(1, b - 1);
      const a = b * q + r;
      // Multiple choice on the remainder keeps the answer a single number.
      return problem(this.id, `${a} ÷ ${b} = ${q} remainder ?`, r, [r + 1, Math.max(0, r - 1), r + 2], `${b} × ${q} = ${b * q}. How many are left over from ${a}?`);
    },
  },
  {
    id: "area_rectangle",
    name: "Area of a rectangle",
    prereqs: ["mult_tables_2_5"],
    band: 4,
    generate() {
      const w = randInt(3, 12);
      const h = randInt(3, 9);
      const ans = w * h;
      return problem(this.id, `A dragon pen is ${w} steps long and ${h} steps wide. What is its area, in square steps?`, ans, [w + h, 2 * (w + h), ans + w], "Area of a rectangle = length × width.");
    },
  },
  {
    id: "area_composite",
    name: "Area of L-shapes",
    prereqs: ["area_rectangle", "add_2digit"],
    band: 4,
    generate() {
      const w1 = randInt(3, 8);
      const h1 = randInt(3, 8);
      const w2 = randInt(2, 6);
      const h2 = randInt(2, 6);
      const ans = w1 * h1 + w2 * h2;
      return problem(
        this.id,
        `An L-shaped roost is made of two rectangles: ${w1}×${h1} and ${w2}×${h2}. What is the total area?`,
        ans,
        [w1 * h1, ans + w2, ans - h2],
        `Find each rectangle's area, then add: (${w1}×${h1}) + (${w2}×${h2}).`,
      );
    },
  },
  {
    id: "volume_box",
    name: "Volume of a box",
    prereqs: ["area_rectangle"],
    band: 4,
    generate() {
      const l = randInt(2, 6);
      const w = randInt(2, 6);
      const h = randInt(2, 5);
      const ans = l * w * h;
      return problem(this.id, `A Leviathan pool is ${l} long, ${w} wide and ${h} deep. What is its volume?`, ans, [l * w, l * w + h, ans + l], "Volume of a box = length × width × depth.");
    },
  },
  {
    id: "fractions_intro",
    name: "Fractions of a group",
    prereqs: ["div_basic"],
    band: 4,
    generate() {
      const d = pick([2, 3, 4, 5]);
      const perPart = randInt(2, 6);
      const total = d * perPart;
      return problem(this.id, `Your hoard has ${total} gems. A dragon eats 1/${d} of them. How many gems does it eat?`, perPart, [perPart + 1, total - perPart, perPart + d], `1/${d} of ${total} means ${total} ÷ ${d}.`);
    },
  },
  {
    id: "fractions_compare",
    name: "Comparing fractions",
    prereqs: ["fractions_intro"],
    band: 4,
    generate() {
      // Same numerator, different denominators — the classic comparison.
      const n = pick([1, 2, 3]);
      let d1 = randInt(2, 9);
      let d2 = randInt(2, 9);
      while (d2 === d1) d2 = randInt(2, 9);
      const bigger = n / d1 > n / d2 ? `${n}/${d1}` : `${n}/${d2}`;
      const smaller = bigger === `${n}/${d1}` ? `${n}/${d2}` : `${n}/${d1}`;
      return {
        skillId: this.id,
        prompt: `Which fraction is BIGGER: ${n}/${d1} or ${n}/${d2}?`,
        answer: bigger,
        choices: shuffle([bigger, smaller]),
        hint: "Same top number? The smaller bottom number means bigger pieces.",
      };
    },
  },
];

export const SKILLS_BY_ID: Record<string, Skill> = Object.fromEntries(SKILLS.map((s) => [s.id, s]));
