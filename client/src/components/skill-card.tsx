import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Hammer, Fish, TreePine, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Skill, Equipment } from "@shared/schema";
import { calculateLevel, getExperienceToNext } from "@/lib/game-engine";

interface SkillCardProps {
  skill: Skill;
  isActive: boolean;
  equipment: Equipment[];
}

const skillIcons = {
  mining: Hammer,
  fishing: Fish,
  woodcutting: TreePine,
  cooking: Flame,
};

const skillColors = {
  mining: "bg-primary",
  fishing: "bg-blue-600",
  woodcutting: "bg-green-700",
  cooking: "bg-orange-600",
};

const skillResources = {
  mining: ["copper_ore", "iron_ore", "coal", "gold_ore"],
  fishing: ["shrimp", "trout", "salmon", "lobster"],
  woodcutting: ["logs", "oak_logs", "willow_logs", "maple_logs"],
  cooking: ["bread", "fish", "stew", "cake"],
};

export function SkillCard({ skill, isActive, equipment }: SkillCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const startTraining = useMutation({
    mutationFn: async (data: { skillType: string; resourceType: string }) => {
      const response = await apiRequest("POST", "/api/skills/start", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
      toast({
        title: "Training Started",
        description: `Started training ${skill.skillType}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const stopTraining = useMutation({
    mutationFn: async (skillType: string) => {
      const response = await apiRequest("POST", "/api/skills/stop", { skillType });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
      toast({
        title: "Training Stopped",
        description: `Stopped training ${skill.skillType}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const IconComponent = skillIcons[skill.skillType as keyof typeof skillIcons] || Hammer;
  const skillColor = skillColors[skill.skillType as keyof typeof skillColors] || "bg-primary";
  const resources = skillResources[skill.skillType as keyof typeof skillResources] || [];
  
  // Calculate equipment bonuses
  const totalExpBonus = equipment.reduce((acc, equip) => acc + equip.experienceBonus, 0);
  const expPerAction = getBaseExpForSkill(skill.skillType) * (1 + totalExpBonus / 100);
  
  const currentLevel = skill.level;
  const expToNext = getExperienceToNext(skill.experience);
  const progressPercent = Math.min(((skill.experience - getExperienceForLevel(currentLevel)) / 
    (getExperienceForLevel(currentLevel + 1) - getExperienceForLevel(currentLevel))) * 100, 100);

  const handleStartTraining = () => {
    const availableResource = resources.find(resource => 
      skill.level >= getRequiredLevelForResource(skill.skillType, resource)
    ) || resources[0];
    
    startTraining.mutate({
      skillType: skill.skillType,
      resourceType: availableResource,
    });
  };

  const handleStopTraining = () => {
    stopTraining.mutate(skill.skillType);
  };

  return (
    <div 
      className="skill-card bg-background rounded-lg border border-border p-4 cursor-pointer"
      data-testid={`skill-card-${skill.skillType}`}
    >
      <div className="flex items-center space-x-3 mb-3">
        <div className={`skill-icon w-12 h-12 ${skillColor} rounded-lg flex items-center justify-center`}>
          <IconComponent className="text-white text-xl w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium capitalize" data-testid={`skill-name-${skill.skillType}`}>
            {skill.skillType}
          </h3>
          <p className="text-sm text-muted-foreground" data-testid={`skill-level-${skill.skillType}`}>
            Level {currentLevel}
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium" data-testid={`skill-exp-${skill.skillType}`}>
            {skill.experience} XP
          </div>
          <div className="text-xs text-muted-foreground" data-testid={`skill-exp-to-next-${skill.skillType}`}>
            {expToNext} to next
          </div>
        </div>
      </div>
      
      <div className="w-full bg-border rounded-full h-2 mb-2">
        <div 
          className="progress-bar"
          style={{ width: `${progressPercent}%` }}
          data-testid={`skill-progress-${skill.skillType}`}
        />
      </div>
      
      <div className="flex justify-between items-center text-xs text-muted-foreground mb-3">
        <span data-testid={`skill-available-${skill.skillType}`}>
          {getAvailableResource(skill.skillType, skill.level)} available
        </span>
        <span data-testid={`skill-exp-rate-${skill.skillType}`}>
          +{Math.round(expPerAction)} XP/action
        </span>
      </div>

      {isActive ? (
        <Button
          onClick={handleStopTraining}
          disabled={stopTraining.isPending}
          variant="outline"
          size="sm"
          className="w-full"
          data-testid={`button-stop-${skill.skillType}`}
        >
          {stopTraining.isPending ? "Stopping..." : "Stop Training"}
        </Button>
      ) : (
        <Button
          onClick={handleStartTraining}
          disabled={startTraining.isPending}
          size="sm"
          className="w-full bg-primary hover:bg-primary/90"
          data-testid={`button-start-${skill.skillType}`}
        >
          {startTraining.isPending ? "Starting..." : "Start Training"}
        </Button>
      )}
    </div>
  );
}

function getBaseExpForSkill(skillType: string): number {
  switch (skillType) {
    case "mining": return 23;
    case "fishing": return 15;
    case "woodcutting": return 19;
    case "cooking": return 12;
    default: return 10;
  }
}

function getExperienceForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor((level - 1) * (level - 1) * 25);
}

function getRequiredLevelForResource(skillType: string, resource: string): number {
  const resourceLevels: Record<string, Record<string, number>> = {
    mining: { copper_ore: 1, iron_ore: 15, coal: 30, gold_ore: 40 },
    fishing: { shrimp: 1, trout: 5, salmon: 25, lobster: 40 },
    woodcutting: { logs: 1, oak_logs: 10, willow_logs: 20, maple_logs: 35 },
    cooking: { bread: 1, fish: 5, stew: 15, cake: 30 },
  };
  
  return resourceLevels[skillType]?.[resource] || 1;
}

function getAvailableResource(skillType: string, level: number): string {
  const resources = skillResources[skillType as keyof typeof skillResources] || [];
  
  for (let i = resources.length - 1; i >= 0; i--) {
    if (level >= getRequiredLevelForResource(skillType, resources[i])) {
      return resources[i].replace("_", " ");
    }
  }
  
  return resources[0]?.replace("_", " ") || "Nothing";
}
