import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { startSkillTrainingSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const DEFAULT_PLAYER_ID = "default-player";

  // Get player data
  app.get("/api/player", async (req, res) => {
    try {
      const player = await storage.getPlayer(DEFAULT_PLAYER_ID);
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }
      
      await storage.updatePlayerLastSeen(DEFAULT_PLAYER_ID);
      res.json(player);
    } catch (error) {
      res.status(500).json({ message: "Failed to get player data" });
    }
  });

  // Get player skills
  app.get("/api/skills", async (req, res) => {
    try {
      const skills = await storage.getPlayerSkills(DEFAULT_PLAYER_ID);
      res.json(skills);
    } catch (error) {
      res.status(500).json({ message: "Failed to get skills data" });
    }
  });

  // Start skill training
  app.post("/api/skills/start", async (req, res) => {
    try {
      const { skillType, resourceType } = startSkillTrainingSchema.parse(req.body);
      
      // Stop all other active training
      const allSkills = await storage.getPlayerSkills(DEFAULT_PLAYER_ID);
      for (const skill of allSkills) {
        if (skill.isActive) {
          await storage.updateSkill(DEFAULT_PLAYER_ID, skill.skillType, {
            isActive: false,
            lastActionTime: new Date(),
          });
        }
      }
      
      // Start the new skill training
      const updatedSkill = await storage.updateSkill(DEFAULT_PLAYER_ID, skillType, {
        isActive: true,
        currentResource: resourceType,
        lastActionTime: new Date(),
      });
      
      if (!updatedSkill) {
        return res.status(404).json({ message: "Skill not found" });
      }
      
      res.json(updatedSkill);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to start skill training" });
    }
  });

  // Stop skill training
  app.post("/api/skills/stop", async (req, res) => {
    try {
      const { skillType } = z.object({ skillType: z.string() }).parse(req.body);
      
      const updatedSkill = await storage.updateSkill(DEFAULT_PLAYER_ID, skillType, {
        isActive: false,
        lastActionTime: new Date(),
      });
      
      if (!updatedSkill) {
        return res.status(404).json({ message: "Skill not found" });
      }
      
      res.json(updatedSkill);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to stop skill training" });
    }
  });

  // Calculate and apply offline progress
  app.post("/api/offline-progress", async (req, res) => {
    try {
      const player = await storage.getPlayer(DEFAULT_PLAYER_ID);
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }

      const skills = await storage.getPlayerSkills(DEFAULT_PLAYER_ID);
      const equipment = await storage.getPlayerEquipment(DEFAULT_PLAYER_ID);
      
      const offlineTime = Date.now() - player.lastSeen.getTime();
      const offlineMinutes = Math.floor(offlineTime / (1000 * 60));
      
      const progress = {
        offlineTime: offlineMinutes,
        gains: [] as Array<{ skill: string, expGained: number, itemsGained: number, levelUps: number }>,
      };

      // Calculate progress for active skills
      for (const skill of skills) {
        if (skill.isActive && skill.lastActionTime) {
          const actionTime = skill.lastActionTime.getTime();
          const progressTime = Math.min(Date.now() - actionTime, offlineTime);
          const progressMinutes = Math.floor(progressTime / (1000 * 60));
          
          if (progressMinutes > 0) {
            // Calculate equipment bonuses
            let efficiencyBonus = 1;
            let expBonus = 1;
            for (const equip of equipment) {
              efficiencyBonus += equip.efficiencyBonus / 100;
              expBonus += equip.experienceBonus / 100;
            }
            
            // Base rates per minute (adjusted for balance)
            const baseExpPerMin = getSkillExpRate(skill.skillType);
            const baseItemsPerMin = 0.8 * efficiencyBonus;
            
            const expGained = Math.floor(progressMinutes * baseExpPerMin * expBonus);
            const itemsGained = Math.floor(progressMinutes * baseItemsPerMin);
            
            const oldLevel = calculateLevel(skill.experience);
            const newExp = skill.experience + expGained;
            const newLevel = calculateLevel(newExp);
            const levelUps = newLevel - oldLevel;
            
            // Update skill
            await storage.updateSkill(DEFAULT_PLAYER_ID, skill.skillType, {
              experience: newExp,
              level: newLevel,
              lastActionTime: new Date(),
            });
            
            // Update inventory with gained items
            if (skill.currentResource && itemsGained > 0) {
              const inventory = await storage.getPlayerInventory(DEFAULT_PLAYER_ID);
              const existingItem = inventory.find(item => item.itemType === skill.currentResource);
              const newQuantity = (existingItem?.quantity || 0) + itemsGained;
              await storage.updateInventoryItem(DEFAULT_PLAYER_ID, skill.currentResource, newQuantity);
            }
            
            progress.gains.push({
              skill: skill.skillType,
              expGained,
              itemsGained,
              levelUps,
            });
          }
        }
      }
      
      await storage.updatePlayerLastSeen(DEFAULT_PLAYER_ID);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate offline progress" });
    }
  });

  // Get inventory
  app.get("/api/inventory", async (req, res) => {
    try {
      const inventory = await storage.getPlayerInventory(DEFAULT_PLAYER_ID);
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ message: "Failed to get inventory data" });
    }
  });

  // Get equipment
  app.get("/api/equipment", async (req, res) => {
    try {
      const equipment = await storage.getPlayerEquipment(DEFAULT_PLAYER_ID);
      res.json(equipment);
    } catch (error) {
      res.status(500).json({ message: "Failed to get equipment data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

function getSkillExpRate(skillType: string): number {
  switch (skillType) {
    case "mining": return 2.3;
    case "fishing": return 1.8;
    case "woodcutting": return 2.0;
    case "cooking": return 1.5;
    default: return 1.0;
  }
}

function calculateLevel(experience: number): number {
  if (experience < 50) return 1;
  return Math.floor(1 + Math.sqrt(experience / 25));
}
