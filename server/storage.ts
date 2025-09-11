import { 
  type User,
  type UpsertUser,
  type Player, 
  type InsertPlayer,
  type Skill,
  type InsertSkill,
  type InventoryItem,
  type InsertInventoryItem,
  type Equipment,
  type InsertEquipment,
  users,
  players,
  skills,
  inventory,
  equipment
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User operations (for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Player operations
  getPlayer(id: string): Promise<Player | undefined>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  createPlayerWithId(id: string, player: InsertPlayer): Promise<Player>;
  updatePlayerLastSeen(id: string): Promise<void>;
  
  // Skill operations
  getPlayerSkills(playerId: string): Promise<Skill[]>;
  updateSkill(playerId: string, skillType: string, updates: Partial<Skill>): Promise<Skill | undefined>;
  createOrUpdateSkill(skill: InsertSkill): Promise<Skill>;
  
  // Inventory operations
  getPlayerInventory(playerId: string): Promise<InventoryItem[]>;
  updateInventoryItem(playerId: string, itemType: string, quantity: number): Promise<InventoryItem>;
  
  // Equipment operations
  getPlayerEquipment(playerId: string): Promise<Equipment[]>;
  updateEquipment(playerId: string, slot: string, equipment: Partial<Equipment>): Promise<Equipment>;
}

export class DatabaseStorage implements IStorage {
  private initializationPromise: Promise<void>;

  constructor() {
    // Initialize default player if needed
    this.initializationPromise = this.initializeDefaultPlayer();
  }

  async ready(): Promise<void> {
    await this.initializationPromise;
  }

  private async initializeDefaultPlayer() {
    const defaultPlayerId = "default-player";
    
    // Check if default player exists
    const existingPlayer = await this.getPlayer(defaultPlayerId);
    if (existingPlayer) return;

    // Create default player
    const defaultPlayer = await db.insert(players).values({
      id: defaultPlayerId,
      name: "Adventurer",
    }).returning();

    // Initialize default skills
    const skillTypes = ["mining", "fishing", "woodcutting", "cooking"];
    for (const skillType of skillTypes) {
      await db.insert(skills).values({
        playerId: defaultPlayerId,
        skillType,
        level: skillType === "mining" ? 15 : skillType === "woodcutting" ? 12 : skillType === "fishing" ? 8 : 6,
        experience: skillType === "mining" ? 1247 : skillType === "woodcutting" ? 891 : skillType === "fishing" ? 523 : 278,
        isActive: skillType === "mining",
        lastActionTime: skillType === "mining" ? new Date(Date.now() - 2 * 60 * 1000) : null,
        currentResource: skillType === "mining" ? "iron_ore" : null,
      });
    }
    
    // Initialize inventory items
    const inventoryItems = [
      { itemType: "iron_ore", quantity: 47 },
      { itemType: "raw_trout", quantity: 23 },
      { itemType: "oak_logs", quantity: 31 },
      { itemType: "cooked_fish", quantity: 12 },
    ];
    
    for (const item of inventoryItems) {
      await db.insert(inventory).values({
        playerId: defaultPlayerId,
        itemType: item.itemType,
        quantity: item.quantity,
      });
    }
    
    // Initialize equipment
    const equipmentSlots = [
      { slot: "tool", itemType: "iron_pickaxe", efficiencyBonus: 15, experienceBonus: 10 },
      { slot: "helmet", itemType: "mining_helmet", efficiencyBonus: 5, experienceBonus: 5 },
      { slot: "gloves", itemType: null, efficiencyBonus: 0, experienceBonus: 0 },
      { slot: "boots", itemType: null, efficiencyBonus: 0, experienceBonus: 0 },
    ];
    
    for (const equip of equipmentSlots) {
      await db.insert(equipment).values({
        playerId: defaultPlayerId,
        slot: equip.slot,
        itemType: equip.itemType,
        efficiencyBonus: equip.efficiencyBonus,
        experienceBonus: equip.experienceBonus,
      });
    }
  }

  // User operations (for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getPlayer(id: string): Promise<Player | undefined> {
    const [player] = await db.select().from(players).where(eq(players.id, id));
    return player || undefined;
  }


  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const [player] = await db.insert(players).values(insertPlayer).returning();
    return player;
  }

  async createPlayerWithId(id: string, insertPlayer: InsertPlayer): Promise<Player> {
    const [player] = await db.insert(players).values({
      ...insertPlayer,
      id,
    }).returning();
    return player;
  }

  async updatePlayerLastSeen(id: string): Promise<void> {
    await db.update(players)
      .set({ lastSeen: new Date() })
      .where(eq(players.id, id));
  }

  async getPlayerSkills(playerId: string): Promise<Skill[]> {
    return await db.select().from(skills).where(eq(skills.playerId, playerId));
  }

  async updateSkill(playerId: string, skillType: string, updates: Partial<Skill>): Promise<Skill | undefined> {
    const [updated] = await db.update(skills)
      .set(updates)
      .where(and(eq(skills.playerId, playerId), eq(skills.skillType, skillType)))
      .returning();
    return updated || undefined;
  }

  async createOrUpdateSkill(insertSkill: InsertSkill): Promise<Skill> {
    const [result] = await db
      .insert(skills)
      .values(insertSkill)
      .onConflictDoUpdate({
        target: [skills.playerId, skills.skillType],
        set: insertSkill,
      })
      .returning();
    return result;
  }

  async getPlayerInventory(playerId: string): Promise<InventoryItem[]> {
    return await db.select().from(inventory).where(eq(inventory.playerId, playerId));
  }

  async updateInventoryItem(playerId: string, itemType: string, quantity: number): Promise<InventoryItem> {
    const [result] = await db
      .insert(inventory)
      .values({
        playerId,
        itemType,
        quantity,
      })
      .onConflictDoUpdate({
        target: [inventory.playerId, inventory.itemType],
        set: {
          quantity,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result;
  }

  async getPlayerEquipment(playerId: string): Promise<Equipment[]> {
    return await db.select().from(equipment).where(eq(equipment.playerId, playerId));
  }

  async updateEquipment(playerId: string, slot: string, updates: Partial<Equipment>): Promise<Equipment> {
    const [result] = await db
      .insert(equipment)
      .values({
        playerId,
        slot,
        itemType: null,
        efficiencyBonus: 0,
        experienceBonus: 0,
        ...updates,
      })
      .onConflictDoUpdate({
        target: [equipment.playerId, equipment.slot],
        set: updates,
      })
      .returning();
    return result;
  }
}

export const storage = new DatabaseStorage();
