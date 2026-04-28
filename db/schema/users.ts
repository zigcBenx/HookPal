import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  password: text("password"),

  role: text("role", { enum: ["admin", "creator"] })
    .default("creator")
    .notNull(),

  status: text("status", {
    enum: ["applied", "active", "rejected", "terminated"],
  })
    .default("applied")
    .notNull(),

  phone: text("phone"),
  bio: text("bio"),
  tiktokHandle: text("tiktok_handle"),
  instagramHandle: text("instagram_handle"),
  youtubeHandle: text("youtube_handle"),
  country: text("country"),

  image: text("image"),
  emailVerified: integer("email_verified", { mode: "timestamp" }),

  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});
