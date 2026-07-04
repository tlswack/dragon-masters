// The three Focus tiers from DESIGN.md ch. 2.4. The aether numbers are the
// core reward economy — tune here, not in components.
export type FocusTierId = "quick" | "medium" | "heavy";

export interface FocusTier {
  id: FocusTierId;
  name: string;
  aether: number;
  tagline: string;
  emoji: string;
}

export const FOCUS_TIERS: FocusTier[] = [
  { id: "quick", name: "Quick Strike", aether: 1, tagline: "An easy one, fast", emoji: "⚡" },
  { id: "medium", name: "Medium Focus", aether: 3, tagline: "A solid challenge", emoji: "🔥" },
  { id: "heavy", name: "Heavy Focus", aether: 5, tagline: "Your hardest problem", emoji: "🌋" },
];
