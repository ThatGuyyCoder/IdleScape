import { Shield, Plus, Hammer, HardHat } from "lucide-react";
import type { Equipment as EquipmentType } from "@shared/schema";

interface EquipmentProps {
  equipment: EquipmentType[];
  bonuses: {
    efficiency: number;
    experience: number;
  };
}

const equipmentIcons: Record<string, any> = {
  tool: Hammer,
  helmet: HardHat,
  gloves: Plus,
  boots: Plus,
};

const equipmentNames: Record<string, string> = {
  iron_pickaxe: "Iron Pickaxe",
  mining_helmet: "Mining Helmet",
  leather_gloves: "Leather Gloves",
  mining_boots: "Mining Boots",
};

export function Equipment({ equipment, bonuses }: EquipmentProps) {
  const equipmentSlots = ["tool", "helmet", "gloves", "boots"];

  const getEquipmentForSlot = (slot: string) => {
    return equipment.find(equip => equip.slot === slot);
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 shadow-sm" data-testid="equipment-panel">
      <h3 className="font-medium mb-4 flex items-center" data-testid="equipment-title">
        <Shield className="w-4 h-4 mr-2 text-primary" />
        Equipment
      </h3>
      
      <div className="grid grid-cols-2 gap-3">
        {equipmentSlots.map((slot) => {
          const equip = getEquipmentForSlot(slot);
          const IconComponent = equipmentIcons[slot] || Plus;
          const isFilled = equip && equip.itemType;

          return (
            <div 
              key={slot}
              className={`equipment-slot rounded-lg h-16 flex items-center justify-center transition-all duration-300 ${
                isFilled ? 'filled' : ''
              }`}
              data-testid={`equipment-slot-${slot}`}
            >
              <IconComponent 
                className={`text-xl w-6 h-6 ${
                  isFilled ? 'text-secondary' : 'text-muted-foreground'
                }`}
              />
            </div>
          );
        })}
      </div>
      
      {(bonuses.efficiency > 0 || bonuses.experience > 0) && (
        <div className="mt-3 text-xs text-muted-foreground text-center" data-testid="equipment-bonuses">
          {bonuses.experience > 0 && `+${bonuses.experience}% XP boost`}
          {bonuses.efficiency > 0 && bonuses.experience > 0 && ' • '}
          {bonuses.efficiency > 0 && `+${bonuses.efficiency}% efficiency`}
        </div>
      )}
    </div>
  );
}
