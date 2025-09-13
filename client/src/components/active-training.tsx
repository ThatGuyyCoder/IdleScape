import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pause, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import type { Skill, Equipment } from "@shared/schema";
import { getExperienceToNext } from "@/lib/game-engine";

interface ActiveTrainingProps {
  skill: Skill;
  equipment: Equipment[];
}

export function ActiveTraining({ skill, equipment }: ActiveTrainingProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [elapsedTime, setElapsedTime] = useState(0);
  
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

  const tickProgress = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/skills/tick");
      return response.json();
    },
    onSuccess: () => {
      // Invalidate queries to refresh the UI with updated progress
      queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
    },
    onError: (error) => {
      console.error("Failed to update skill progress:", error);
    },
  });

  useEffect(() => {
    const interval = setInterval(() => {
      if (skill.lastActionTime) {
        // Ensure proper date parsing
        const lastActionDate = new Date(skill.lastActionTime);
        const now = Date.now();
        const elapsed = Math.floor((now - lastActionDate.getTime()) / 1000);
        
        // Ensure elapsed time is never negative
        const validElapsed = Math.max(0, elapsed);
        setElapsedTime(validElapsed);
        
        if (elapsed < 0) {
          console.log("[DEBUG] Negative elapsed time detected:", elapsed, "lastActionTime:", skill.lastActionTime, "now:", new Date(now));
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [skill.lastActionTime]);

  // Real-time progress tick every 3 seconds while training is active
  useEffect(() => {
    if (skill.isActive) {
      console.log("[DEBUG] Starting skill tick interval for", skill.skillType);
      const tickInterval = setInterval(() => {
        console.log("[DEBUG] Calling skills/tick for", skill.skillType);
        tickProgress.mutate();
      }, 3000); // Tick every 3 seconds

      return () => {
        console.log("[DEBUG] Clearing skill tick interval for", skill.skillType);
        clearInterval(tickInterval);
      };
    }
  }, [skill.isActive]);

  const totalExpBonus = equipment.reduce((acc, equip) => acc + equip.experienceBonus, 0);
  const baseExp = getBaseExpForSkill(skill.skillType);
  const expPerAction = Math.floor(baseExp * (1 + totalExpBonus / 100));
  
  const currentLevel = skill.level;
  const expToNext = getExperienceToNext(skill.experience);
  const progressPercent = Math.min(((skill.experience - getExperienceForLevel(currentLevel)) / 
    (getExperienceForLevel(currentLevel + 1) - getExperienceForLevel(currentLevel))) * 100, 100);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getActivityImage = (skillType: string) => {
    switch (skillType) {
      case "mining":
        return "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100";
      case "fishing":
        return "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100";
      case "woodcutting":
        return "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100";
      case "cooking":
        return "https://images.unsplash.com/photo-1504973960431-1c467e159aa4?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100";
      default:
        return "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100";
    }
  };

  const getActivityText = (skillType: string, resource: string) => {
    const resourceNames: Record<string, string> = {
      copper_ore: "Copper Ore",
      iron_ore: "Iron Ore",
      coal: "Coal",
      gold_ore: "Gold Ore",
      shrimp: "Shrimp",
      trout: "Trout",
      salmon: "Salmon",
      lobster: "Lobster",
      logs: "Logs",
      oak_logs: "Oak Logs",
      willow_logs: "Willow Logs",
      maple_logs: "Maple Logs",
      bread: "Bread",
      fish: "Fish",
      stew: "Stew",
      cake: "Cake",
    };
    
    const actions: Record<string, string> = {
      mining: "Mining",
      fishing: "Fishing",
      woodcutting: "Cutting",
      cooking: "Cooking",
    };
    
    return `${actions[skillType] || "Working on"} ${resourceNames[resource] || resource.replace("_", " ")}`;
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-sm" data-testid="active-training">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold" data-testid="currently-training-title">
          Currently Training
        </h2>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span data-testid="training-time">
            {formatTime(elapsedTime)} elapsed
          </span>
        </div>
      </div>
      
      <div className="flex items-center space-x-4 p-4 bg-muted rounded-lg">
        <img 
          src={getActivityImage(skill.skillType)}
          alt={`${skill.skillType} activity`}
          className="w-16 h-16 rounded-lg object-cover"
          data-testid="activity-image"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium" data-testid="activity-title">
              {getActivityText(skill.skillType, skill.currentResource || "")}
            </h3>
            <span className="text-sm text-muted-foreground" data-testid="activity-level">
              Level {currentLevel}
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span data-testid="activity-progress">
                {Math.round(progressPercent)}%
              </span>
            </div>
            <div className="w-full bg-border rounded-full h-2">
              <div 
                className="progress-bar"
                style={{ width: `${progressPercent}%` }}
                data-testid="activity-progress-bar"
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span data-testid="activity-exp-progress">
                {skill.experience} / {skill.experience + expToNext} XP
              </span>
              <span data-testid="activity-exp-rate">
                +{expPerAction} XP/action
              </span>
            </div>
          </div>
        </div>
        <Button
          onClick={() => stopTraining.mutate(skill.skillType)}
          disabled={stopTraining.isPending}
          className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90"
          data-testid="pause-training-button"
        >
          <Pause className="w-4 h-4 mr-2" />
          {stopTraining.isPending ? "Stopping..." : "Pause"}
        </Button>
      </div>
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
