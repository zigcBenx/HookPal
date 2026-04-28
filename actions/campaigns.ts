"use server";

import { db } from "@/db";
import { campaigns, campaignAssignments } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/dal";
import { campaignSchema } from "@/validators/campaigns";

export async function createCampaign(values: {
  name: string;
  description?: string;
  basePay: number;
  minVideos: number;
  bonusPer1kViews: number;
  startDate: Date;
  endDate: Date;
}) {
  await requireAdmin();

  const parsed = campaignSchema.safeParse(values);
  if (!parsed.success) return { error: "Invalid fields" };

  const { name, description, basePay, minVideos, bonusPer1kViews, startDate, endDate } =
    parsed.data;

  await db.insert(campaigns).values({
    name,
    description,
    basePay,
    minVideos,
    bonusPer1kViews,
    startDate,
    endDate,
  });

  revalidatePath("/campaigns");
  return { success: "Campaign created" };
}

export async function updateCampaign(
  campaignId: string,
  values: {
    name: string;
    description?: string;
    basePay: number;
    minVideos: number;
    bonusPer1kViews: number;
    startDate: Date;
    endDate: Date;
  }
) {
  await requireAdmin();

  const parsed = campaignSchema.safeParse(values);
  if (!parsed.success) return { error: "Invalid fields" };

  const { name, description, basePay, minVideos, bonusPer1kViews, startDate, endDate } =
    parsed.data;

  await db
    .update(campaigns)
    .set({
      name,
      description,
      basePay,
      minVideos,
      bonusPer1kViews,
      startDate,
      endDate,
      updatedAt: new Date(),
    })
    .where(eq(campaigns.id, campaignId));

  revalidatePath("/campaigns");
  revalidatePath(`/campaigns/${campaignId}`);
  return { success: "Campaign updated" };
}

export async function updateCampaignStatus(
  campaignId: string,
  status: "draft" | "active" | "completed" | "cancelled"
) {
  await requireAdmin();

  await db
    .update(campaigns)
    .set({ status, updatedAt: new Date() })
    .where(eq(campaigns.id, campaignId));

  revalidatePath("/campaigns");
  revalidatePath(`/campaigns/${campaignId}`);
}

export async function assignCreator(campaignId: string, creatorId: string) {
  await requireAdmin();

  // Check if already assigned
  const [existing] = await db
    .select()
    .from(campaignAssignments)
    .where(
      and(
        eq(campaignAssignments.campaignId, campaignId),
        eq(campaignAssignments.creatorId, creatorId)
      )
    );

  if (existing) return { error: "Creator already assigned" };

  await db.insert(campaignAssignments).values({ campaignId, creatorId });

  revalidatePath(`/campaigns/${campaignId}`);
  return { success: "Creator assigned" };
}

export async function removeCreator(campaignId: string, creatorId: string) {
  await requireAdmin();

  await db
    .delete(campaignAssignments)
    .where(
      and(
        eq(campaignAssignments.campaignId, campaignId),
        eq(campaignAssignments.creatorId, creatorId)
      )
    );

  revalidatePath(`/campaigns/${campaignId}`);
  return { success: "Creator removed" };
}
