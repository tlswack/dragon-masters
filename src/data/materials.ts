// Raw building materials (DESIGN.md ch. 7) — inventory is just numbers.
export interface Material {
  id: string;
  name: string;
  emoji: string;
}

export const MATERIALS: Record<string, Material> = {
  adamantine: { id: "adamantine", name: "Adamantine", emoji: "🪨" },
  aqua_glass: { id: "aqua_glass", name: "Aqua-glass", emoji: "🫧" },
  brimstone: { id: "brimstone", name: "Brimstone", emoji: "🟠" },
  emberwood: { id: "emberwood", name: "Emberwood", emoji: "🪵" },
  skyglass: { id: "skyglass", name: "Skyglass", emoji: "🔷" },
};
