"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateCampaignStatus } from "@/actions/campaigns";

type Status = "draft" | "active" | "completed" | "cancelled";

// Defines which status transitions are allowed.
// For example, a "draft" campaign can move to "active" or "cancelled".
const transitions: Record<Status, { label: string; next: Status }[]> = {
  draft: [
    { label: "Activate", next: "active" },
    { label: "Cancel", next: "cancelled" },
  ],
  active: [
    { label: "Complete", next: "completed" },
    { label: "Cancel", next: "cancelled" },
  ],
  completed: [],
  cancelled: [],
};

export function CampaignStatus({
  campaignId,
  currentStatus,
}: {
  campaignId: string;
  currentStatus: Status;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const available = transitions[currentStatus];

  if (available.length === 0) return null;

  function handleTransition(next: Status) {
    startTransition(async () => {
      await updateCampaignStatus(campaignId, next);
      toast.success(`Campaign marked as ${next}.`);
      router.refresh();
    });
  }

  return (
    <div className="flex gap-2">
      {available.map(({ label, next }) => (
        <Button
          key={next}
          variant={next === "cancelled" ? "destructive" : "default"}
          size="sm"
          onClick={() => handleTransition(next)}
          disabled={isPending}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
