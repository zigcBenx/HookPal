"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { assignCreator, removeCreator } from "@/actions/campaigns";
import { getActiveCreators } from "@/actions/creators";

// Shape of a creator that's already assigned to this campaign.
// Matches the SELECT shape from the server component.
type AssignedCreator = {
  id: string;
  name: string;
  email: string;
  assignedAt: Date;
};

// Shape of an available creator returned by getActiveCreators.
type AvailableCreator = {
  id: string;
  name: string;
  email: string;
};

export function AssignedCreators({
  campaignId,
  creators,
  isAdmin,
}: {
  campaignId: string;
  creators: AssignedCreator[];
  isAdmin: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [available, setAvailable] = useState<AvailableCreator[]>([]);
  const router = useRouter();

  // When the dialog opens, fetch the list of active creators
  // that aren't already assigned to this campaign.
  useEffect(() => {
    if (!dialogOpen) return;

    getActiveCreators().then((all) => {
      // Filter out creators who are already assigned
      const assignedIds = new Set(creators.map((c) => c.id));
      setAvailable(all.filter((c) => !assignedIds.has(c.id)));
    });
  }, [dialogOpen, creators]);

  function handleAssign(creatorId: string) {
    startTransition(async () => {
      const result = await assignCreator(campaignId, creatorId);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success(result.success);
      setDialogOpen(false);
      router.refresh();
    });
  }

  function handleRemove(creatorId: string) {
    startTransition(async () => {
      const result = await removeCreator(campaignId, creatorId);
      toast.success(result.success);
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Assigned Creators ({creators.length})</CardTitle>
          <CardDescription>
            Creators working on this campaign.
          </CardDescription>
        </div>

        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-1 h-4 w-4" />
                Assign
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign a Creator</DialogTitle>
                <DialogDescription>
                  Pick from active creators not yet assigned to this campaign.
                </DialogDescription>
              </DialogHeader>

              <div className="max-h-64 space-y-1 overflow-y-auto">
                {available.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    No available creators to assign.
                  </p>
                ) : (
                  available.map((creator) => (
                    <button
                      key={creator.id}
                      onClick={() => handleAssign(creator.id)}
                      disabled={isPending}
                      className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-accent disabled:opacity-50"
                    >
                      <div className="text-left">
                        <p className="font-medium">{creator.name}</p>
                        <p className="text-muted-foreground">
                          {creator.email}
                        </p>
                      </div>
                      <Plus className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>

      <CardContent>
        {creators.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No creators assigned yet.
          </p>
        ) : (
          <div className="space-y-2">
            {creators.map((creator) => (
              <div
                key={creator.id}
                className="flex items-center justify-between rounded-md border px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{creator.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {creator.email}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    Assigned {creator.assignedAt.toLocaleDateString()}
                  </span>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemove(creator.id)}
                      disabled={isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
