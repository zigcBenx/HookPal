import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { users } from "./users";

export const campaigns = sqliteTable("campaigns", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  name: text("name").notNull(),
  description: text("description"),

  // Payment conditions
  basePay: real("base_pay").notNull(), // Fixed payment per creator
  minVideos: integer("min_videos").notNull(), // Minimum videos required for base pay
  bonusPerView: real("bonus_per_view").default(0).notNull(), // Extra pay per view

  // Timeline
  startDate: integer("start_date", { mode: "timestamp" }).notNull(),
  endDate: integer("end_date", { mode: "timestamp" }).notNull(),

  status: text("status", {
    enum: ["draft", "active", "completed", "cancelled"],
  })
    .default("draft")
    .notNull(),

  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Join table: which creators are assigned to which campaigns.
// This is a many-to-many relationship — one campaign can have many creators,
// and one creator can be in many campaigns.
export const campaignAssignments = sqliteTable("campaign_assignments", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  campaignId: text("campaign_id")
    .notNull()
    .references(() => campaigns.id, { onDelete: "cascade" }),
  creatorId: text("creator_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  assignedAt: integer("assigned_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});
