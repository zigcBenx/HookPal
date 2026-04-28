import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreatorActions } from "./creator-actions";

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  applied: "outline",
  active: "default",
  rejected: "destructive",
  terminated: "secondary",
};

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

  const initials = creator.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const socials = [
    { label: "TikTok", value: creator.tiktokHandle },
    { label: "Instagram", value: creator.instagramHandle },
    { label: "YouTube", value: creator.youtubeHandle },
  ].filter((s) => s.value);

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/admin/creators"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to creators
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">
                {creator.name}
              </h1>
              <Badge variant={statusVariant[creator.status]}>
                {creator.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">{creator.email}</p>
          </div>
        </div>
        <CreatorActions creatorId={creator.id} status={creator.status} />
      </div>

      <Separator />

      {/* Details */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Personal details and contact info.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow label="Email" value={creator.email} />
            <InfoRow label="Phone" value={creator.phone} />
            <InfoRow label="Country" value={creator.country} />
            <InfoRow
              label="Joined"
              value={creator.createdAt.toLocaleDateString()}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Social Profiles</CardTitle>
            <CardDescription>Connected platform handles.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {socials.length > 0 ? (
              socials.map((s) => (
                <InfoRow key={s.label} label={s.label} value={s.value} />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No social profiles provided.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bio */}
      {creator.bio && (
        <Card>
          <CardHeader>
            <CardTitle>Bio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {creator.bio}
            </p>
          </CardContent>
        </Card>
      )}
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
