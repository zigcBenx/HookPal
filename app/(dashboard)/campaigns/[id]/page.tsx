import { db } from "@/db";
import { campaigns, campaignAssignments, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAuth } from "@/lib/dal";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CampaignStatus } from "./campaign-status";
import { AssignedCreators } from "./assigned-creators";

const statusVariant: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  draft: "outline",
  active: "default",
  completed: "secondary",
  cancelled: "destructive",
};

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireAuth();
  const isAdmin = user.role === "admin";

  // Fetch the campaign
  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.id, id));

  if (!campaign) notFound();

  // Fetch assigned creators by joining campaignAssignments → users.
  // This gives us creator info (name, email) alongside the assignment.
  const assignedCreators = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      assignedAt: campaignAssignments.assignedAt,
    })
    .from(campaignAssignments)
    .innerJoin(users, eq(campaignAssignments.creatorId, users.id))
    .where(eq(campaignAssignments.campaignId, id));

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/campaigns"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to campaigns
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {campaign.name}
            </h1>
            <Badge variant={statusVariant[campaign.status]}>
              {campaign.status}
            </Badge>
          </div>
          {campaign.description && (
            <p className="mt-1 text-muted-foreground">
              {campaign.description}
            </p>
          )}
        </div>

        {/* Admin-only status controls */}
        {isAdmin && (
          <CampaignStatus
            campaignId={campaign.id}
            currentStatus={campaign.status}
          />
        )}
      </div>

      <Separator />

      {/* Campaign info cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Payment Terms</CardTitle>
            <CardDescription>
              How creators get paid for this campaign.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow
              label="Base Pay"
              value={`$${campaign.basePay.toFixed(2)}`}
            />
            <InfoRow
              label="Min Videos Required"
              value={String(campaign.minVideos)}
            />
            <InfoRow
              label="Bonus per 1K Views"
              value={`$${campaign.bonusPer1kViews.toFixed(2)}`}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
            <CardDescription>
              Campaign start and end dates.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow
              label="Start Date"
              value={campaign.startDate.toLocaleDateString()}
            />
            <InfoRow
              label="End Date"
              value={campaign.endDate.toLocaleDateString()}
            />
            <InfoRow label="Status" value={campaign.status} />
            <InfoRow
              label="Created"
              value={campaign.createdAt.toLocaleDateString()}
            />
          </CardContent>
        </Card>
      </div>

      {/* Assigned creators section */}
      <AssignedCreators
        campaignId={campaign.id}
        creators={assignedCreators}
        isAdmin={isAdmin}
      />
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value || "—"}</span>
    </div>
  );
}
