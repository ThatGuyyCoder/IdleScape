import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp, boolean, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const players = pgTable("players", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().default("Adventurer"),
  lastSeen: timestamp("last_seen").notNull().default(sql`now()`),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const skills = pgTable("skills", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  playerId: varchar("player_id").notNull().references(() => players.id),
  skillType: text("skill_type").notNull(), // mining, fishing, woodcutting, cooking
  level: integer("level").notNull().default(1),
  experience: integer("experience").notNull().default(0),
  isActive: boolean("is_active").notNull().default(false),
  lastActionTime: timestamp("last_action_time"),
  currentResource: text("current_resource"), // what they're currently working on
}, (table) => ({
  playerSkillUnique: unique().on(table.playerId, table.skillType),
}));

export const inventory = pgTable("inventory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  playerId: varchar("player_id").notNull().references(() => players.id),
  itemType: text("item_type").notNull(),
  quantity: integer("quantity").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
}, (table) => ({
  playerItemUnique: unique().on(table.playerId, table.itemType),
}));

export const equipment = pgTable("equipment", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  playerId: varchar("player_id").notNull().references(() => players.id),
  slot: text("slot").notNull(), // tool, helmet, etc
  itemType: text("item_type"),
  efficiencyBonus: integer("efficiency_bonus").notNull().default(0),
  experienceBonus: integer("experience_bonus").notNull().default(0),
}, (table) => ({
  playerSlotUnique: unique().on(table.playerId, table.slot),
}));

// Game configuration schemas
export const skillConfigSchema = z.object({
  skillType: z.enum(["mining", "fishing", "woodcutting", "cooking"]),
  level: z.number().min(1),
  experience: z.number().min(0),
  isActive: z.boolean(),
  lastActionTime: z.string().optional(),
  currentResource: z.string().optional(),
});

export const inventoryItemSchema = z.object({
  itemType: z.string(),
  quantity: z.number().min(0),
});

export const equipmentItemSchema = z.object({
  slot: z.string(),
  itemType: z.string().optional(),
  efficiencyBonus: z.number().default(0),
  experienceBonus: z.number().default(0),
});

export const startSkillTrainingSchema = z.object({
  skillType: z.enum(["mining", "fishing", "woodcutting", "cooking"]),
  resourceType: z.string(),
});

export const insertPlayerSchema = createInsertSchema(players).omit({
  id: true,
  createdAt: true,
});

export const insertSkillSchema = createInsertSchema(skills).omit({
  id: true,
});

export const insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
  updatedAt: true,
});

export const insertEquipmentSchema = createInsertSchema(equipment).omit({
  id: true,
});

export type Player = typeof players.$inferSelect;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Skill = typeof skills.$inferSelect;
export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type InventoryItem = typeof inventory.$inferSelect;
export type InsertInventoryItem = z.infer<typeof insertInventorySchema>;
export type Equipment = typeof equipment.$inferSelect;
export type InsertEquipment = z.infer<typeof insertEquipmentSchema>;

export type SkillConfig = z.infer<typeof skillConfigSchema>;
export type InventoryItemData = z.infer<typeof inventoryItemSchema>;
export type EquipmentItemData = z.infer<typeof equipmentItemSchema>;
export type StartSkillTraining = z.infer<typeof startSkillTrainingSchema>;
