"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { campaignSchema, type CampaignInput } from "@/validators/campaigns";
import { createCampaign, updateCampaign } from "@/actions/campaigns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// This form handles both create and edit.
// When `initialData` is provided, it's in edit mode.
interface CampaignFormProps {
  initialData?: CampaignInput & { id: string };
}

export function CampaignForm({ initialData }: CampaignFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(campaignSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          startDate: initialData.startDate,
          endDate: initialData.endDate,
        }
      : {
          name: "",
          description: "",
          basePay: 0,
          minVideos: 1,
          bonusPer1kViews: 0,
        },
  });

  function onSubmit(data: Record<string, unknown>) {
    const values = data as CampaignInput;
    startTransition(async () => {
      const result = isEditing
        ? await updateCampaign(initialData!.id, values)
        : await createCampaign(values);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(result.success);
      router.push("/campaigns");
    });
  }

  // Format a Date to "YYYY-MM-DD" for <input type="date">
  function toDateString(date?: Date) {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
            <CardDescription>
              Basic information about the campaign.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Campaign Name</Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input id="description" {...register("description")} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment</CardTitle>
            <CardDescription>
              How creators get paid for this campaign.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="basePay">Base Pay ($)</Label>
                <Input
                  id="basePay"
                  type="number"
                  step="0.01"
                  {...register("basePay")}
                />
                {errors.basePay && (
                  <p className="text-sm text-destructive">
                    {errors.basePay.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="minVideos">Min Videos</Label>
                <Input
                  id="minVideos"
                  type="number"
                  {...register("minVideos")}
                />
                {errors.minVideos && (
                  <p className="text-sm text-destructive">
                    {errors.minVideos.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bonusPer1kViews">Bonus per 1K Views ($)</Label>
                <Input
                  id="bonusPer1kViews"
                  type="number"
                  step="0.01"
                  {...register("bonusPer1kViews")}
                />
                {errors.bonusPer1kViews && (
                  <p className="text-sm text-destructive">
                    {errors.bonusPer1kViews.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
            <CardDescription>
              When the campaign starts and ends.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  defaultValue={toDateString(initialData?.startDate)}
                  {...register("startDate")}
                />
                {errors.startDate && (
                  <p className="text-sm text-destructive">
                    {errors.startDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  defaultValue={toDateString(initialData?.endDate)}
                  {...register("endDate")}
                />
                {errors.endDate && (
                  <p className="text-sm text-destructive">
                    {errors.endDate.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button type="submit" disabled={isPending}>
            {isEditing ? "Save Changes" : "Create Campaign"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending}
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
}
