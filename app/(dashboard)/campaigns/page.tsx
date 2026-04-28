import { db } from "@/db";
import { campaigns, campaignAssignments } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { requireAuth } from "@/lib/dal";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function CampaignsPage() {
  const user = await requireAuth();
  const isAdmin = user.role === "admin";

  // Fetch campaigns with a count of assigned creators.
  // LEFT JOIN keeps campaigns that have 0 assignments.
  // GROUP BY collapses the joined rows back into one row per campaign.
  const rows = await db
    .select({
      id: campaigns.id,
      name: campaigns.name,
      status: campaigns.status,
      basePay: campaigns.basePay,
      minVideos: campaigns.minVideos,
      startDate: campaigns.startDate,
      endDate: campaigns.endDate,
      creatorCount: sql<number>`count(${campaignAssignments.creatorId})`,
    })
    .from(campaigns)
    .leftJoin(
      campaignAssignments,
      eq(campaigns.id, campaignAssignments.campaignId)
    )
    .groupBy(campaigns.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground">
            {isAdmin
              ? "Create and manage campaigns."
              : "View your assigned campaigns."}
          </p>
        </div>
        {isAdmin && (
          <Button asChild>
            <Link href="/campaigns/new">
              <Plus className="h-4 w-4" />
              New Campaign
            </Link>
          </Button>
        )}
      </div>

      <DataTable columns={columns} data={rows} />
    </div>
  );
}
