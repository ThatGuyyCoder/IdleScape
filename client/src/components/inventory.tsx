import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";
import type { InventoryItem } from "@shared/schema";

interface InventoryProps {
  items: InventoryItem[];
  currentCount: number;
  maxCount: number;
}

const itemImages: Record<string, string> = {
  iron_ore: "https://images.unsplash.com/photo-1509773896068-7fd415d91e2e?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40",
  raw_trout: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40",
  oak_logs: "https://pixabay.com/get/gb2c80a5452e952ec2b1f725cc7b33f490519fe583363dc2c892c348fd14c2d91b068ee60089fb8c86850588c90ce1cba8879cc869016849bcdfdd83c34f18712_1280.jpg",
  cooked_fish: "https://images.unsplash.com/photo-1504973960431-1c467e159aa4?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40",
  copper_ore: "https://images.unsplash.com/photo-1509773896068-7fd415d91e2e?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40",
  coal: "https://images.unsplash.com/photo-1509773896068-7fd415d91e2e?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40",
  gold_ore: "https://images.unsplash.com/photo-1509773896068-7fd415d91e2e?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40",
  shrimp: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40",
  trout: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40",
  salmon: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40",
  lobster: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40",
  logs: "https://pixabay.com/get/gb2c80a5452e952ec2b1f725cc7b33f490519fe583363dc2c892c348fd14c2d91b068ee60089fb8c86850588c90ce1cba8879cc869016849bcdfdd83c34f18712_1280.jpg",
  willow_logs: "https://pixabay.com/get/gb2c80a5452e952ec2b1f725cc7b33f490519fe583363dc2c892c348fd14c2d91b068ee60089fb8c86850588c90ce1cba8879cc869016849bcdfdd83c34f18712_1280.jpg",
  maple_logs: "https://pixabay.com/get/gb2c80a5452e952ec2b1f725cc7b33f490519fe583363dc2c892c348fd14c2d91b068ee60089fb8c86850588c90ce1cba8879cc869016849bcdfdd83c34f18712_1280.jpg",
};

const itemNames: Record<string, string> = {
  iron_ore: "Iron Ore",
  raw_trout: "Raw Trout",
  oak_logs: "Oak Logs",
  cooked_fish: "Cooked Fish",
  copper_ore: "Copper Ore",
  coal: "Coal",
  gold_ore: "Gold Ore",
  shrimp: "Shrimp",
  trout: "Trout",
  salmon: "Salmon",
  lobster: "Lobster",
  logs: "Logs",
  willow_logs: "Willow Logs",
  maple_logs: "Maple Logs",
  bread: "Bread",
  fish: "Fish",
  stew: "Stew",
  cake: "Cake",
};

export function Inventory({ items, currentCount, maxCount }: InventoryProps) {
  // Filter out items with 0 quantity and sort by quantity descending
  const visibleItems = items
    .filter(item => item.quantity > 0)
    .sort((a, b) => b.quantity - a.quantity);

  return (
    <div className="bg-card rounded-lg border border-border p-4 shadow-sm" data-testid="inventory-panel">
      <h3 className="font-medium mb-4 flex items-center" data-testid="inventory-title">
        <Package className="w-4 h-4 mr-2 text-primary" />
        Inventory 
        <span className="ml-auto text-sm text-muted-foreground" data-testid="inventory-count">
          {currentCount}/{maxCount}
        </span>
      </h3>
      
      <ScrollArea className="h-64">
        <div className="space-y-2">
          {visibleItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground" data-testid="inventory-empty">
              <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Your inventory is empty</p>
              <p className="text-xs">Start training skills to collect items</p>
            </div>
          ) : (
            visibleItems.map((item) => (
              <div 
                key={item.id}
                className="resource-item flex items-center justify-between p-2 rounded border border-border hover:bg-muted/50 transition-colors"
                data-testid={`inventory-item-${item.itemType}`}
              >
                <div className="flex items-center space-x-2">
                  <img 
                    src={itemImages[item.itemType] || itemImages.iron_ore}
                    alt={itemNames[item.itemType] || item.itemType}
                    className="w-8 h-8 rounded object-cover"
                    data-testid={`item-image-${item.itemType}`}
                  />
                  <span className="text-sm font-medium" data-testid={`item-name-${item.itemType}`}>
                    {itemNames[item.itemType] || item.itemType.replace("_", " ")}
                  </span>
                </div>
                <span 
                  className="text-sm text-muted-foreground font-medium" 
                  data-testid={`item-quantity-${item.itemType}`}
                >
                  {item.quantity}
                </span>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
      
      <Button 
        variant="outline"
        className="w-full mt-3 text-sm"
        data-testid="auto-organize-button"
      >
        <Package className="w-4 h-4 mr-2" />
        Auto-organize
      </Button>
    </div>
  );
}
