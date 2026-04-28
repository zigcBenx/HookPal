import { z } from "zod";

export const campaignSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().optional(),
    basePay: z.coerce.number().min(0, "Base pay must be positive"),
    minVideos: z.coerce.number().int().min(1, "At least 1 video required"),
    bonusPer1kViews: z.coerce.number().min(0, "Bonus must be positive"),
    startDate: z.coerce.date({ required_error: "Start date is required" }),
    endDate: z.coerce.date({ required_error: "End date is required" }),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  });

// z.infer gives the OUTPUT type (after coercion).
// We use z.output explicitly to be clear this is the validated type.
export type CampaignInput = z.output<typeof campaignSchema>;
