"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  approveCreator,
  rejectCreator,
  terminateCreator,
} from "@/actions/creators";

type Status = "applied" | "active" | "rejected" | "terminated";

export function CreatorActions({
  creatorId,
  status,
}: {
  creatorId: string;
  status: Status;
}) {
  // useTransition lets us show a pending state while the server action runs,
  // without blocking the UI. isPending is true while the action is in flight.
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleAction(action: () => Promise<void>, label: string) {
    startTransition(async () => {
      await action();
      toast.success(`Creator ${label}.`);
      router.refresh();
    });
  }

  return (
    <div className="flex gap-2">
      {status === "applied" && (
        <>
          <Button
            onClick={() => handleAction(() => approveCreator(creatorId), "approved")}
            disabled={isPending}
          >
            Approve
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleAction(() => rejectCreator(creatorId), "rejected")}
            disabled={isPending}
          >
            Reject
          </Button>
        </>
      )}

      {status === "active" && (
        <Button
          variant="destructive"
          onClick={() => handleAction(() => terminateCreator(creatorId), "terminated")}
          disabled={isPending}
        >
          Terminate
        </Button>
      )}

      {status === "rejected" && (
        <Button
          onClick={() => handleAction(() => approveCreator(creatorId), "approved")}
          disabled={isPending}
        >
          Approve
        </Button>
      )}

      {status === "terminated" && (
        <Button
          onClick={() => handleAction(() => approveCreator(creatorId), "re-activated")}
          disabled={isPending}
        >
          Re-activate
        </Button>
      )}
    </div>
  );
}
