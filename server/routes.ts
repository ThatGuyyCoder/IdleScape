import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { startSkillTrainingSchema } from "@shared/schema";
import { z } from "zod";
import { setupAuth, isAuthenticated } from "./replitAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  const DEFAULT_PLAYER_ID = "default-player";

  // Setup authentication
  await setupAuth(app);

  // Helper function to get player ID based on authentication
  const getPlayerId = async (req: any): Promise<string> => {
    if (req.isAuthenticated() && req.user?.claims?.sub) {
      const userId = req.user.claims.sub;
      // Try to find existing player for this user
      let player = await storage.getPlayer(`user-${userId}`);
      
      if (!player) {
        // Create new player for authenticated user
        player = await storage.createPlayerWithId(`user-${userId}`, {
          name: req.user.claims.email?.split('@')[0] || "Adventurer",
        });

        // Initialize default skills for new user
        const skillTypes = ["mining", "fishing", "woodcutting", "cooking"];
        for (const skillType of skillTypes) {
          await storage.createOrUpdateSkill({
            playerId: player.id,
            skillType,
            level: 1,
            experience: 0,
            isActive: false,
          });
        }

        // Initialize basic equipment slots
        const equipmentSlots = [
          { slot: "tool", itemType: null, efficiencyBonus: 0, experienceBonus: 0 },
          { slot: "helmet", itemType: null, efficiencyBonus: 0, experienceBonus: 0 },
          { slot: "gloves", itemType: null, efficiencyBonus: 0, experienceBonus: 0 },
          { slot: "boots", itemType: null, efficiencyBonus: 0, experienceBonus: 0 },
        ];
        
        for (const equip of equipmentSlots) {
          await storage.updateEquipment(player.id, equip.slot, equip);
        }
      }
      
      return player.id;
    }
    
    // Return session-based player for guests to avoid data sharing
    const sessionId = req.sessionID || 'fallback-guest';
    const guestPlayerId = `guest-${sessionId}`;
    
    // Create guest player if it doesn't exist
    let guestPlayer = await storage.getPlayer(guestPlayerId);
    if (!guestPlayer) {
      guestPlayer = await storage.createPlayerWithId(guestPlayerId, {
        name: "Külaline",
      });

      // Initialize default skills for new guest
      const skillTypes = ["mining", "fishing", "woodcutting", "cooking"];
      for (const skillType of skillTypes) {
        await storage.createOrUpdateSkill({
          playerId: guestPlayer.id,
          skillType,
          level: 1,
          experience: 0,
          isActive: false,
        });
      }

      // Initialize basic equipment slots
      const equipmentSlots = [
        { slot: "tool", itemType: null, efficiencyBonus: 0, experienceBonus: 0 },
        { slot: "helmet", itemType: null, efficiencyBonus: 0, experienceBonus: 0 },
        { slot: "gloves", itemType: null, efficiencyBonus: 0, experienceBonus: 0 },
        { slot: "boots", itemType: null, efficiencyBonus: 0, experienceBonus: 0 },
      ];
      
      for (const equip of equipmentSlots) {
        await storage.updateEquipment(guestPlayer.id, equip.slot, equip);
      }
    }
    
    return guestPlayerId;
  };

  // Auth user endpoint  
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get player data
  app.get("/api/player", async (req: any, res) => {
    try {
      const playerId = await getPlayerId(req);
      const player = await storage.getPlayer(playerId);
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }
      
      await storage.updatePlayerLastSeen(playerId);
      res.json(player);
    } catch (error) {
      res.status(500).json({ message: "Failed to get player data" });
    }
  });

  // Get player skills
  app.get("/api/skills", async (req: any, res) => {
    try {
      const playerId = await getPlayerId(req);
      const skills = await storage.getPlayerSkills(playerId);
      res.json(skills);
    } catch (error) {
      res.status(500).json({ message: "Failed to get skills data" });
    }
  });

  // Start skill training
  app.post("/api/skills/start", async (req: any, res) => {
    try {
      const playerId = await getPlayerId(req);
      const { skillType, resourceType } = startSkillTrainingSchema.parse(req.body);
      
      // Stop all other active training
      const allSkills = await storage.getPlayerSkills(playerId);
      for (const skill of allSkills) {
        if (skill.isActive) {
          await storage.updateSkill(playerId, skill.skillType, {
            isActive: false,
            lastActionTime: new Date(),
          });
        }
      }
      
      // Start the new skill training
      const updatedSkill = await storage.updateSkill(playerId, skillType, {
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
  app.post("/api/skills/stop", async (req: any, res) => {
    try {
      const playerId = await getPlayerId(req);
      const { skillType } = z.object({ skillType: z.string() }).parse(req.body);
      
      const updatedSkill = await storage.updateSkill(playerId, skillType, {
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
  app.post("/api/offline-progress", async (req: any, res) => {
    try {
      const playerId = await getPlayerId(req);
      const player = await storage.getPlayer(playerId);
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }

      const skills = await storage.getPlayerSkills(playerId);
      const equipment = await storage.getPlayerEquipment(playerId);
      
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
            await storage.updateSkill(playerId, skill.skillType, {
              experience: newExp,
              level: newLevel,
              lastActionTime: new Date(),
            });
            
            // Update inventory with gained items
            if (skill.currentResource && itemsGained > 0) {
              const inventory = await storage.getPlayerInventory(playerId);
              const existingItem = inventory.find(item => item.itemType === skill.currentResource);
              const newQuantity = (existingItem?.quantity || 0) + itemsGained;
              await storage.updateInventoryItem(playerId, skill.currentResource, newQuantity);
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
      
      await storage.updatePlayerLastSeen(playerId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate offline progress" });
    }
  });

  // Get inventory
  app.get("/api/inventory", async (req: any, res) => {
    try {
      const playerId = await getPlayerId(req);
      const inventory = await storage.getPlayerInventory(playerId);
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ message: "Failed to get inventory data" });
    }
  });

  // Get equipment
  app.get("/api/equipment", async (req: any, res) => {
    try {
      const playerId = await getPlayerId(req);
      const equipment = await storage.getPlayerEquipment(playerId);
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
