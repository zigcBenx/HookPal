"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function handleAction(action: () => Promise<void>, label: string) {
    startTransition(async () => {
      await action();
      setOpen(false);
      toast.success(`Creator ${label}.`);
      router.refresh();
    });
  }

  if (status === "applied") {
    return (
      <div className="flex gap-2">
        <Button
          onClick={() =>
            handleAction(() => approveCreator(creatorId), "approved")
          }
          disabled={isPending}
        >
          Approve
        </Button>
        <ConfirmDialog
          open={open}
          onOpenChange={setOpen}
          trigger={
            <Button variant="destructive" disabled={isPending}>
              Reject
            </Button>
          }
          title="Reject creator?"
          description="This creator will be marked as rejected and won't be able to access the platform."
          confirmLabel="Reject"
          onConfirm={() =>
            handleAction(() => rejectCreator(creatorId), "rejected")
          }
          isPending={isPending}
        />
      </div>
    );
  }

  if (status === "active") {
    return (
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        trigger={
          <Button variant="destructive" disabled={isPending}>
            Terminate
          </Button>
        }
        title="Terminate creator?"
        description="This creator will lose access to the platform. You can re-activate them later."
        confirmLabel="Terminate"
        onConfirm={() =>
          handleAction(() => terminateCreator(creatorId), "terminated")
        }
        isPending={isPending}
      />
    );
  }

  if (status === "rejected") {
    return (
      <Button
        onClick={() =>
          handleAction(() => approveCreator(creatorId), "approved")
        }
        disabled={isPending}
      >
        Approve
      </Button>
    );
  }

  if (status === "terminated") {
    return (
      <Button
        onClick={() =>
          handleAction(() => approveCreator(creatorId), "re-activated")
        }
        disabled={isPending}
      >
        Re-activate
      </Button>
    );
  }

  return null;
}

function ConfirmDialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  confirmLabel,
  onConfirm,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: React.ReactNode;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  isPending: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
