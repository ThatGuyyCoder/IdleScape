import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Bell, Cog, User, Star, Clock, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { SkillCard } from "@/components/skill-card";
import { ActiveTraining } from "@/components/active-training";
import { Inventory } from "@/components/inventory";
import { Equipment } from "@/components/equipment";
import { Statistics } from "@/components/statistics";
import { OfflineProgressModal } from "@/components/offline-progress-modal";
import { calculateOfflineProgress } from "@/lib/offline-progress";
import type { Player, Skill, InventoryItem, Equipment as EquipmentType } from "@shared/schema";

export default function Game() {
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [offlineProgress, setOfflineProgress] = useState<any>(null);
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const { data: player, isLoading: playerLoading } = useQuery<Player>({
    queryKey: ["/api/player"],
  });

  const { data: skills = [], isLoading: skillsLoading } = useQuery<Skill[]>({
    queryKey: ["/api/skills"],
  });

  const { data: inventory = [], isLoading: inventoryLoading } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory"],
  });

  const { data: equipment = [], isLoading: equipmentLoading } = useQuery<EquipmentType[]>({
    queryKey: ["/api/equipment"],
  });

  useEffect(() => {
    // Check for offline progress on mount
    const checkOfflineProgress = async () => {
      const lastSeen = localStorage.getItem("lastSeen");
      const now = Date.now();
      
      if (lastSeen) {
        const offlineTime = now - parseInt(lastSeen);
        if (offlineTime > 5 * 60 * 1000) { // More than 5 minutes offline
          try {
            const response = await fetch("/api/offline-progress", {
              method: "POST",
            });
            const progress = await response.json();
            
            if (progress.gains && progress.gains.length > 0) {
              setOfflineProgress(progress);
              setShowOfflineModal(true);
            }
          } catch (error) {
            console.error("Failed to calculate offline progress:", error);
          }
        }
      }
      
      localStorage.setItem("lastSeen", now.toString());
    };

    if (player) {
      checkOfflineProgress();
    }
  }, [player]);

  // Update last seen timestamp periodically
  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem("lastSeen", Date.now().toString());
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const activeSkill = skills.find(skill => skill.isActive);
  const totalLevel = skills.reduce((sum, skill) => sum + skill.level, 0);
  const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const maxInventory = 50;

  const totalEquipmentBonus = equipment.reduce((acc, equip) => ({
    efficiency: acc.efficiency + equip.efficiencyBonus,
    experience: acc.experience + equip.experienceBonus,
  }), { efficiency: 0, experience: 0 });

  if (playerLoading || skillsLoading || inventoryLoading || equipmentLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your adventure...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground font-sans min-h-screen">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-primary font-serif" data-testid="game-title">
                AFK Skills
              </h1>
              <div className="hidden md:flex items-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4 text-primary" />
                  <span data-testid="player-name">{player?.name || "Adventurer"}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-secondary" />
                  <span data-testid="total-level">Level {totalLevel}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="relative text-muted-foreground hover:text-foreground"
                data-testid="notifications-button"
              >
                <Bell className="w-5 h-5" />
                <span className="notification-badge absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  3
                </span>
              </Button>
              
              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground"
                    data-testid="user-menu"
                  >
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {isAuthenticated ? (
                    <>
                      <DropdownMenuItem disabled className="text-center">
                        <User className="w-4 h-4 mr-2" />
                        {user?.email || "Logged In"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => window.location.href = "/api/logout"}
                        data-testid="logout-button"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Log Out
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem disabled className="text-center">
                        <User className="w-4 h-4 mr-2" />
                        Guest Player
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => setLocation("/landing")}
                        data-testid="login-link"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Log In to Save Progress
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Game Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Active Training Section */}
            {activeSkill && (
              <ActiveTraining 
                skill={activeSkill}
                equipment={equipment}
              />
            )}

            {/* Skill Categories */}
            <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-6" data-testid="skills-title">
                Skills
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {skills.map((skill) => (
                  <SkillCard 
                    key={skill.id} 
                    skill={skill}
                    isActive={skill.isActive}
                    equipment={equipment}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Equipment equipment={equipment} bonuses={totalEquipmentBonus} />
            <Inventory 
              items={inventory} 
              currentCount={totalItems} 
              maxCount={maxInventory} 
            />
            <Statistics 
              skills={skills} 
              inventory={inventory}
              offlineTime={offlineProgress?.offlineTime || 0}
            />
          </div>
        </div>
      </div>

      {/* Offline Progress Modal */}
      {showOfflineModal && offlineProgress && (
        <OfflineProgressModal
          progress={offlineProgress}
          onClose={() => setShowOfflineModal(false)}
        />
      )}
    </div>
  );
}
