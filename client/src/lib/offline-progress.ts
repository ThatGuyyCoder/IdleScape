import type { Skill, Equipment } from "@shared/schema";
import { calculateSkillProgress } from "./game-engine";

export interface OfflineProgressResult {
  offlineTime: number; // in minutes
  gains: Array<{
    skill: string;
    expGained: number;
    itemsGained: number;
    levelUps: number;
    oldLevel: number;
    newLevel: number;
  }>;
  totalExpGained: number;
  totalItemsGained: number;
  totalLevelUps: number;
}

export function calculateOfflineProgress(
  skills: Skill[],
  equipment: Equipment[],
  lastSeenTimestamp: number
): OfflineProgressResult {
  const now = Date.now();
  const offlineTimeMs = now - lastSeenTimestamp;
  const offlineTimeMinutes = Math.floor(offlineTimeMs / (1000 * 60));
  
  const gains: OfflineProgressResult['gains'] = [];
  let totalExpGained = 0;
  let totalItemsGained = 0;
  let totalLevelUps = 0;

  // Only calculate progress for active skills
  const activeSkills = skills.filter(skill => skill.isActive && skill.lastActionTime);

  for (const skill of activeSkills) {
    const skillLastActionTime = new Date(skill.lastActionTime!).getTime();
    const skillOfflineTime = Math.min(now - skillLastActionTime, offlineTimeMs);
    
    if (skillOfflineTime <= 0) continue;

    // Get equipment bonuses for this skill
    const relevantEquipment = equipment.filter(equip => 
      equip.itemType && isEquipmentRelevantForSkill(equip.itemType, skill.skillType)
    );

    const progress = calculateSkillProgress(
      {
        skillType: skill.skillType,
        level: skill.level,
        experience: skill.experience,
        lastActionTime: new Date(skill.lastActionTime!),
        currentResource: skill.currentResource || "",
      },
      relevantEquipment,
      skillOfflineTime
    );

    if (progress.expGained > 0 || progress.itemsGained > 0) {
      const levelUps = progress.newLevel - skill.level;
      
      gains.push({
        skill: skill.skillType,
        expGained: progress.expGained,
        itemsGained: progress.itemsGained,
        levelUps,
        oldLevel: skill.level,
        newLevel: progress.newLevel,
      });

      totalExpGained += progress.expGained;
      totalItemsGained += progress.itemsGained;
      totalLevelUps += levelUps;
    }
  }

  return {
    offlineTime: offlineTimeMinutes,
    gains,
    totalExpGained,
    totalItemsGained,
    totalLevelUps,
  };
}

function isEquipmentRelevantForSkill(equipmentType: string, skillType: string): boolean {
  const relevantEquipment: Record<string, string[]> = {
    mining: ["iron_pickaxe", "steel_pickaxe", "mining_helmet"],
    fishing: ["fishing_rod", "fly_fishing_rod"],
    woodcutting: ["iron_axe", "steel_axe"],
    cooking: ["cooking_pot", "chef_hat"],
  };

  return relevantEquipment[skillType]?.includes(equipmentType) || false;
}

// Save game state to localStorage
export function saveGameState(skills: Skill[], inventory: any[], equipment: Equipment[]) {
  const gameState = {
    skills,
    inventory,
    equipment,
    timestamp: Date.now(),
  };
  
  localStorage.setItem("afk-skills-game-state", JSON.stringify(gameState));
}

// Load game state from localStorage
export function loadGameState(): {
  skills?: Skill[];
  inventory?: any[];
  equipment?: Equipment[];
  timestamp?: number;
} | null {
  try {
    const saved = localStorage.getItem("afk-skills-game-state");
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error("Failed to load game state:", error);
    return null;
  }
}

// Format time duration for display
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours < 24) {
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }
  
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
}
