import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Download, X } from "lucide-react";

interface SaveProgressNotificationProps {
  onDismiss?: () => void;
}

export function SaveProgressNotification({ onDismiss }: SaveProgressNotificationProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const saveProgressMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/save-guest-progress");
      return response.json();
    },
    onSuccess: (data) => {
      if (data.transferred) {
        toast({
          title: "Progress Saved!",
          description: `Successfully transferred progress from ${data.guestPlayer} to your account.`,
          duration: 5000,
        });
        
        // Refresh player data to show the transferred progress
        queryClient.invalidateQueries({ queryKey: ["/api/player"] });
        queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
        queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
        queryClient.invalidateQueries({ queryKey: ["/api/equipment"] });
        
        setIsDismissed(true);
        onDismiss?.();
      } else {
        toast({
          title: "No Progress to Transfer",
          description: data.message || "No guest progress was found to transfer.",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      console.error("Failed to save guest progress:", error);
      toast({
        title: "Transfer Failed",
        description: error.message || "Failed to transfer guest progress. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSaveProgress = () => {
    saveProgressMutation.mutate();
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  if (isDismissed) {
    return null;
  }

  return (
    <Alert className="mb-4 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/50" data-testid="save-progress-notification">
      <Download className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1 mr-4">
          <strong className="text-blue-800 dark:text-blue-200">Welcome back!</strong>
          <span className="text-blue-700 dark:text-blue-300 ml-2">
            Would you like to save your guest progress to your account?
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleSaveProgress}
            disabled={saveProgressMutation.isPending}
            data-testid="save-progress-button"
          >
            {saveProgressMutation.isPending ? "Saving..." : "Save Progress"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDismiss}
            data-testid="dismiss-save-progress"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}