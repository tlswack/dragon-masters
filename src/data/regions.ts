// The campaign world (DESIGN.md ch. 8): each region is themed to a lineage or
// aspect AND a band of the skill graph, so travelling the world IS the curriculum.
export interface RegionBattle {
  id: string;
  name: string;
  enemySpeciesId: string;
  blurb: string;
}

export interface Region {
  id: string;
  name: string;
  emoji: string;
  description: string;
  // Boss unlocks when the region's battles are done AND these skills are
  // mastering (>= 0.5). Progression and learning are the same axis.
  requiredSkills: string[];
  battles: RegionBattle[];
  boss: RegionBattle;
}

export const REGIONS: Region[] = [
  {
    id: "emberreach",
    name: "Emberreach Foothills",
    emoji: "🌋",
    description: "Warm hills of Terra and Inferno dragons. Sharpen your adding and subtracting!",
    requiredSkills: ["add_within_20", "sub_within_20"],
    battles: [
      {
        id: "pebble_path",
        name: "The Pebble Path",
        enemySpeciesId: "boulderback",
        blurb: "A grumpy Boulderback blocks the trail.",
      },
      {
        id: "cinder_grove",
        name: "Cinder Grove",
        enemySpeciesId: "cinderling",
        blurb: "A wild Cinderling darts between smoking trees.",
      },
      {
        id: "scorched_wall",
        name: "The Scorched Wall",
        enemySpeciesId: "boulderback",
        blurb: "Another Boulderback guards the cliff pass.",
      },
    ],
    boss: {
      id: "cragmaw_boss",
      name: "Cragmaw's Hollow",
      enemySpeciesId: "cragmaw",
      blurb: "The Terra-Drake of the Foothills. Break its will and tether it!",
    },
  },
  {
    id: "stormspire",
    name: "Stormspire Cliffs",
    emoji: "🌩️",
    description: "Windswept cliffs of Tempest Wyverns. Times tables carry you here!",
    requiredSkills: ["mult_tables_2_5", "mult_tables_6_9"],
    battles: [
      {
        id: "gale_ledge",
        name: "Gale Ledge",
        enemySpeciesId: "galewing",
        blurb: "A Galewing wheels above the drop.",
      },
      {
        id: "howling_stair",
        name: "The Howling Stair",
        enemySpeciesId: "galewing",
        blurb: "Another Galewing dives from the spray.",
      },
    ],
    boss: {
      id: "zephyrix_boss",
      name: "The Eye of the Storm",
      enemySpeciesId: "zephyrix",
      blurb: "Zephyrix hides in High Air — force it to land, or strike it from the sky!",
    },
  },
];
