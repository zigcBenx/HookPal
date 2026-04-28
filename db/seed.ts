import { db } from "./index";
import { users } from "./schema";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("Seeding database...");

  // Hash the password — 10 is the "salt rounds" (how many times bcrypt
  // re-hashes). Higher = more secure but slower. 10 is the standard.
  const hashedPassword = await bcrypt.hash("password", 10);

  // Insert the admin user
  await db.insert(users).values({
    name: "Admin",
    email: "admin@admin.com",
    password: hashedPassword,
    role: "admin",
    status: "active",
  });

  console.log("Admin user created:");
  console.log("  Email: admin@admin.com");
  console.log("  Password: password");
  console.log("Done!");
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
