import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Moon, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OfflineProgressModalProps {
  progress: {
    offlineTime: number;
    gains: Array<{
      skill: string;
      expGained: number;
      itemsGained: number;
      levelUps: number;
    }>;
  };
  onClose: () => void;
}

export function OfflineProgressModal({ progress, onClose }: OfflineProgressModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Show modal with animation
    setTimeout(() => setIsVisible(true), 100);
    
    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
    queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
  }, [queryClient]);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation to complete
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 offline-modal flex items-center justify-center p-4 z-50"
      onClick={handleClose}
      data-testid="offline-progress-modal"
    >
      <div 
        className="bg-card rounded-lg border border-border p-6 max-w-md w-full shadow-2xl transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
        data-testid="offline-progress-content"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <Moon className="text-secondary-foreground w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold mb-2" data-testid="welcome-back-title">
            Welcome Back!
          </h2>
          <p className="text-muted-foreground" data-testid="offline-duration">
            You were away for {formatTime(progress.offlineTime)}
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="bg-muted rounded-lg p-4">
            <h3 className="font-medium mb-3 flex items-center" data-testid="offline-progress-title">
              <Star className="w-4 h-4 mr-2 text-secondary" />
              Offline Progress
            </h3>
            
            <div className="space-y-2 text-sm">
              {progress.gains.map((gain, index) => (
                <div key={index} className="space-y-1">
                  {gain.expGained > 0 && (
                    <div className="flex justify-between" data-testid={`gain-exp-${gain.skill}`}>
                      <span className="capitalize">{gain.skill} XP gained</span>
                      <span className="text-secondary font-medium">+{gain.expGained} XP</span>
                    </div>
                  )}
                  
                  {gain.itemsGained > 0 && (
                    <div className="flex justify-between" data-testid={`gain-items-${gain.skill}`}>
                      <span>Items collected</span>
                      <span className="text-secondary font-medium">+{gain.itemsGained}</span>
                    </div>
                  )}
                  
                  {gain.levelUps > 0 && (
                    <div className="flex justify-between" data-testid={`gain-levelup-${gain.skill}`}>
                      <span>Level ups</span>
                      <span className="text-secondary font-medium">
                        {gain.skill.charAt(0).toUpperCase() + gain.skill.slice(1)}: +{gain.levelUps}
                      </span>
                    </div>
                  )}
                </div>
              ))}
              
              {progress.gains.length === 0 && (
                <div className="text-center text-muted-foreground py-2" data-testid="no-progress">
                  No progress was made while offline
                </div>
              )}
            </div>
          </div>
          
          <Button 
            onClick={handleClose}
            className="w-full py-3 bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
            data-testid="continue-adventure-button"
          >
            Continue Adventure
          </Button>
        </div>
      </div>
    </div>
  );
}
