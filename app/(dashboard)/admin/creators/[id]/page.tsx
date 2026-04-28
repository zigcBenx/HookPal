import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreatorActions } from "./creator-actions";

export default async function CreatorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [creator] = await db
    .select()
    .from(users)
    .where(eq(users.id, id));

  if (!creator || creator.role !== "creator") {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{creator.name}</h1>
          <p className="text-muted-foreground">{creator.email}</p>
        </div>
        <CreatorActions creatorId={creator.id} status={creator.status} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              variant={
                creator.status === "active"
                  ? "default"
                  : creator.status === "rejected"
                    ? "destructive"
                    : "secondary"
              }
            >
              {creator.status}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Country</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{creator.country || "Not provided"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Phone</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{creator.phone || "Not provided"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">TikTok</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{creator.tiktokHandle || "—"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Instagram</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{creator.instagramHandle || "—"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">YouTube</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{creator.youtubeHandle || "—"}</p>
          </CardContent>
        </Card>
      </div>

      {creator.bio && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{creator.bio}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
