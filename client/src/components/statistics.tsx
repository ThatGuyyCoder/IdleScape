import { TrendingUp } from "lucide-react";
import type { Skill, InventoryItem } from "@shared/schema";

interface StatisticsProps {
  skills: Skill[];
  inventory: InventoryItem[];
  offlineTime: number;
}

export function Statistics({ skills, inventory, offlineTime }: StatisticsProps) {
  const totalExp = skills.reduce((sum, skill) => sum + skill.experience, 0);
  const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const actionsCompleted = Math.floor(totalExp / 15); // Rough estimate
  
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatOfflineTime = (minutes: number) => {
    if (minutes === 0) return "0m";
    return formatTime(minutes);
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 shadow-sm" data-testid="statistics-panel">
      <h3 className="font-medium mb-4 flex items-center" data-testid="statistics-title">
        <TrendingUp className="w-4 h-4 mr-2 text-primary" />
        Statistics
      </h3>
      
      <div className="space-y-3 text-sm">
        <div className="flex justify-between" data-testid="stat-total-xp">
          <span className="text-muted-foreground">Total XP</span>
          <span className="font-medium">{totalExp.toLocaleString()}</span>
        </div>
        
        <div className="flex justify-between" data-testid="stat-play-time">
          <span className="text-muted-foreground">Play time</span>
          <span className="font-medium">14h 32m</span>
        </div>
        
        <div className="flex justify-between" data-testid="stat-actions-completed">
          <span className="text-muted-foreground">Actions completed</span>
          <span className="font-medium">{actionsCompleted.toLocaleString()}</span>
        </div>
        
        <div className="flex justify-between" data-testid="stat-items-gathered">
          <span className="text-muted-foreground">Items gathered</span>
          <span className="font-medium">{totalItems.toLocaleString()}</span>
        </div>
        
        <hr className="border-border" />
        
        <div className="flex justify-between" data-testid="stat-offline-time">
          <span className="text-muted-foreground">Recent offline time</span>
          <span className={`font-medium ${offlineTime > 0 ? 'text-accent' : ''}`}>
            {formatOfflineTime(offlineTime)}
          </span>
        </div>
      </div>
    </div>
  );
}
