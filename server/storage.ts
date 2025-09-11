import { 
  type Player, 
  type InsertPlayer,
  type Skill,
  type InsertSkill,
  type InventoryItem,
  type InsertInventoryItem,
  type Equipment,
  type InsertEquipment
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Player operations
  getPlayer(id: string): Promise<Player | undefined>;
  createPlayer(player: InsertPlayer): Promise<Player>;
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

export class MemStorage implements IStorage {
  private players: Map<string, Player>;
  private skills: Map<string, Skill>;
  private inventory: Map<string, InventoryItem>;
  private equipment: Map<string, Equipment>;

  constructor() {
    this.players = new Map();
    this.skills = new Map();
    this.inventory = new Map();
    this.equipment = new Map();
    
    // Initialize default player
    this.initializeDefaultPlayer();
  }

  private async initializeDefaultPlayer() {
    const defaultPlayerId = "default-player";
    const defaultPlayer: Player = {
      id: defaultPlayerId,
      name: "Adventurer",
      lastSeen: new Date(),
      createdAt: new Date(),
    };
    
    this.players.set(defaultPlayerId, defaultPlayer);
    
    // Initialize default skills
    const skillTypes = ["mining", "fishing", "woodcutting", "cooking"];
    for (const skillType of skillTypes) {
      const skill: Skill = {
        id: randomUUID(),
        playerId: defaultPlayerId,
        skillType,
        level: skillType === "mining" ? 15 : skillType === "woodcutting" ? 12 : skillType === "fishing" ? 8 : 6,
        experience: skillType === "mining" ? 1247 : skillType === "woodcutting" ? 891 : skillType === "fishing" ? 523 : 278,
        isActive: skillType === "mining",
        lastActionTime: skillType === "mining" ? new Date(Date.now() - 2 * 60 * 1000) : null,
        currentResource: skillType === "mining" ? "iron_ore" : null,
      };
      this.skills.set(`${defaultPlayerId}-${skillType}`, skill);
    }
    
    // Initialize inventory items
    const inventoryItems = [
      { itemType: "iron_ore", quantity: 47 },
      { itemType: "raw_trout", quantity: 23 },
      { itemType: "oak_logs", quantity: 31 },
      { itemType: "cooked_fish", quantity: 12 },
    ];
    
    for (const item of inventoryItems) {
      const inventoryItem: InventoryItem = {
        id: randomUUID(),
        playerId: defaultPlayerId,
        itemType: item.itemType,
        quantity: item.quantity,
        updatedAt: new Date(),
      };
      this.inventory.set(`${defaultPlayerId}-${item.itemType}`, inventoryItem);
    }
    
    // Initialize equipment
    const equipmentSlots = [
      { slot: "tool", itemType: "iron_pickaxe", efficiencyBonus: 15, experienceBonus: 10 },
      { slot: "helmet", itemType: "mining_helmet", efficiencyBonus: 5, experienceBonus: 5 },
      { slot: "gloves", itemType: null, efficiencyBonus: 0, experienceBonus: 0 },
      { slot: "boots", itemType: null, efficiencyBonus: 0, experienceBonus: 0 },
    ];
    
    for (const equip of equipmentSlots) {
      const equipment: Equipment = {
        id: randomUUID(),
        playerId: defaultPlayerId,
        slot: equip.slot,
        itemType: equip.itemType,
        efficiencyBonus: equip.efficiencyBonus,
        experienceBonus: equip.experienceBonus,
      };
      this.equipment.set(`${defaultPlayerId}-${equip.slot}`, equipment);
    }
  }

  async getPlayer(id: string): Promise<Player | undefined> {
    return this.players.get(id);
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const id = randomUUID();
    const player: Player = { 
      ...insertPlayer, 
      id,
      createdAt: new Date(),
      lastSeen: new Date(),
    };
    this.players.set(id, player);
    return player;
  }

  async updatePlayerLastSeen(id: string): Promise<void> {
    const player = this.players.get(id);
    if (player) {
      player.lastSeen = new Date();
      this.players.set(id, player);
    }
  }

  async getPlayerSkills(playerId: string): Promise<Skill[]> {
    return Array.from(this.skills.values()).filter(skill => skill.playerId === playerId);
  }

  async updateSkill(playerId: string, skillType: string, updates: Partial<Skill>): Promise<Skill | undefined> {
    const key = `${playerId}-${skillType}`;
    const skill = this.skills.get(key);
    if (skill) {
      const updatedSkill = { ...skill, ...updates };
      this.skills.set(key, updatedSkill);
      return updatedSkill;
    }
    return undefined;
  }

  async createOrUpdateSkill(insertSkill: InsertSkill): Promise<Skill> {
    const key = `${insertSkill.playerId}-${insertSkill.skillType}`;
    const existing = this.skills.get(key);
    
    if (existing) {
      const updated = { ...existing, ...insertSkill };
      this.skills.set(key, updated);
      return updated;
    } else {
      const skill: Skill = {
        id: randomUUID(),
        ...insertSkill,
      };
      this.skills.set(key, skill);
      return skill;
    }
  }

  async getPlayerInventory(playerId: string): Promise<InventoryItem[]> {
    return Array.from(this.inventory.values()).filter(item => item.playerId === playerId);
  }

  async updateInventoryItem(playerId: string, itemType: string, quantity: number): Promise<InventoryItem> {
    const key = `${playerId}-${itemType}`;
    const existing = this.inventory.get(key);
    
    if (existing) {
      existing.quantity = quantity;
      existing.updatedAt = new Date();
      this.inventory.set(key, existing);
      return existing;
    } else {
      const item: InventoryItem = {
        id: randomUUID(),
        playerId,
        itemType,
        quantity,
        updatedAt: new Date(),
      };
      this.inventory.set(key, item);
      return item;
    }
  }

  async getPlayerEquipment(playerId: string): Promise<Equipment[]> {
    return Array.from(this.equipment.values()).filter(equip => equip.playerId === playerId);
  }

  async updateEquipment(playerId: string, slot: string, updates: Partial<Equipment>): Promise<Equipment> {
    const key = `${playerId}-${slot}`;
    const existing = this.equipment.get(key);
    
    if (existing) {
      const updated = { ...existing, ...updates };
      this.equipment.set(key, updated);
      return updated;
    } else {
      const equipment: Equipment = {
        id: randomUUID(),
        playerId,
        slot,
        itemType: null,
        efficiencyBonus: 0,
        experienceBonus: 0,
        ...updates,
      };
      this.equipment.set(key, equipment);
      return equipment;
    }
  }
}

export const storage = new MemStorage();
