"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/dal";

// All three actions follow the same pattern:
// 1. Verify the caller is an admin (server-side, not just UI)
// 2. Update the user's status in the database
// 3. Revalidate the page so Next.js refetches the data

export async function approveCreator(creatorId: string) {
  await requireAdmin();

  await db
    .update(users)
    .set({ status: "active", updatedAt: new Date() })
    .where(eq(users.id, creatorId));

  revalidatePath("/admin/creators");
}

export async function rejectCreator(creatorId: string) {
  await requireAdmin();

  await db
    .update(users)
    .set({ status: "rejected", updatedAt: new Date() })
    .where(eq(users.id, creatorId));

  revalidatePath("/admin/creators");
}

export async function terminateCreator(creatorId: string) {
  await requireAdmin();

  await db
    .update(users)
    .set({ status: "terminated", updatedAt: new Date() })
    .where(eq(users.id, creatorId));

  revalidatePath("/admin/creators");
}
