// Experience and leveling calculations
export function calculateLevel(experience: number): number {
  if (experience < 50) return 1;
  return Math.floor(1 + Math.sqrt(experience / 25));
}

export function getExperienceForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor((level - 1) * (level - 1) * 25);
}

export function getExperienceToNext(currentExperience: number): number {
  const currentLevel = calculateLevel(currentExperience);
  const nextLevelExp = getExperienceForLevel(currentLevel + 1);
  return nextLevelExp - currentExperience;
}

// Skill progression rates
export const skillRates = {
  mining: {
    baseExpPerAction: 23,
    baseTimePerAction: 4000, // milliseconds
    resources: {
      copper_ore: { level: 1, exp: 15 },
      iron_ore: { level: 15, exp: 23 },
      coal: { level: 30, exp: 35 },
      gold_ore: { level: 40, exp: 52 },
    }
  },
  fishing: {
    baseExpPerAction: 15,
    baseTimePerAction: 3500,
    resources: {
      shrimp: { level: 1, exp: 10 },
      trout: { level: 5, exp: 15 },
      salmon: { level: 25, exp: 28 },
      lobster: { level: 40, exp: 45 },
    }
  },
  woodcutting: {
    baseExpPerAction: 19,
    baseTimePerAction: 3800,
    resources: {
      logs: { level: 1, exp: 12 },
      oak_logs: { level: 10, exp: 19 },
      willow_logs: { level: 20, exp: 30 },
      maple_logs: { level: 35, exp: 48 },
    }
  },
  cooking: {
    baseExpPerAction: 12,
    baseTimePerAction: 2500,
    resources: {
      bread: { level: 1, exp: 8 },
      fish: { level: 5, exp: 12 },
      stew: { level: 15, exp: 20 },
      cake: { level: 30, exp: 35 },
    }
  }
};

// Calculate offline progress for a skill
export function calculateSkillProgress(
  skill: {
    skillType: string;
    level: number;
    experience: number;
    lastActionTime: Date;
    currentResource: string;
  },
  equipment: { efficiencyBonus: number; experienceBonus: number }[],
  offlineTimeMs: number
): {
  expGained: number;
  itemsGained: number;
  newLevel: number;
  newExperience: number;
} {
  const skillType = skill.skillType as keyof typeof skillRates;
  const skillConfig = skillRates[skillType];
  
  if (!skillConfig) {
    return { expGained: 0, itemsGained: 0, newLevel: skill.level, newExperience: skill.experience };
  }

  // Calculate equipment bonuses
  const totalEfficiencyBonus = equipment.reduce((acc, equip) => acc + equip.efficiencyBonus, 0);
  const totalExperienceBonus = equipment.reduce((acc, equip) => acc + equip.experienceBonus, 0);

  // Calculate how many actions could be performed
  const timePerAction = skillConfig.baseTimePerAction / (1 + totalEfficiencyBonus / 100);
  const actionsCompleted = Math.floor(offlineTimeMs / timePerAction);
  
  if (actionsCompleted <= 0) {
    return { expGained: 0, itemsGained: 0, newLevel: skill.level, newExperience: skill.experience };
  }

  // Calculate experience gained
  const baseExp = skillConfig.baseExpPerAction;
  const expPerAction = baseExp * (1 + totalExperienceBonus / 100);
  const expGained = Math.floor(actionsCompleted * expPerAction);
  
  // Calculate new level and experience
  const newExperience = skill.experience + expGained;
  const newLevel = calculateLevel(newExperience);
  
  // Items gained (slightly less than actions to account for failures)
  const successRate = 0.85 + (skill.level * 0.005); // Success rate improves with level
  const itemsGained = Math.floor(actionsCompleted * successRate);

  return {
    expGained,
    itemsGained,
    newLevel,
    newExperience,
  };
}

// Equipment bonuses
export const equipmentBonuses = {
  // Mining equipment
  iron_pickaxe: { efficiency: 15, experience: 10 },
  steel_pickaxe: { efficiency: 25, experience: 15 },
  mining_helmet: { efficiency: 5, experience: 5 },
  
  // Fishing equipment
  fishing_rod: { efficiency: 10, experience: 8 },
  fly_fishing_rod: { efficiency: 20, experience: 12 },
  
  // Woodcutting equipment
  iron_axe: { efficiency: 15, experience: 10 },
  steel_axe: { efficiency: 25, experience: 15 },
  
  // Cooking equipment
  cooking_pot: { efficiency: 12, experience: 8 },
  chef_hat: { efficiency: 8, experience: 12 },
};

// Get available resources for a skill level
export function getAvailableResources(skillType: string, level: number): string[] {
  const skillConfig = skillRates[skillType as keyof typeof skillRates];
  if (!skillConfig) return [];
  
  return Object.entries(skillConfig.resources)
    .filter(([_, config]) => level >= config.level)
    .map(([resource]) => resource);
}

// Get best resource for current level
export function getBestResource(skillType: string, level: number): string {
  const available = getAvailableResources(skillType, level);
  return available[available.length - 1] || available[0] || "";
}
