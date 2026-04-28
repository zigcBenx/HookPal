"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export type CampaignRow = {
  id: string;
  name: string;
  status: "draft" | "active" | "completed" | "cancelled";
  basePay: number;
  minVideos: number;
  startDate: Date;
  endDate: Date;
  creatorCount: number;
};

const statusVariant: Record<
  CampaignRow["status"],
  "default" | "secondary" | "destructive" | "outline"
> = {
  draft: "outline",
  active: "default",
  completed: "secondary",
  cancelled: "destructive",
};

export const columns: ColumnDef<CampaignRow>[] = [
  {
    accessorKey: "name",
    header: "Campaign",
    cell: ({ row }) => (
      <Link
        href={`/campaigns/${row.original.id}`}
        className="font-medium hover:underline"
      >
        {row.getValue("name")}
      </Link>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as CampaignRow["status"];
      return <Badge variant={statusVariant[status]}>{status}</Badge>;
    },
  },
  {
    accessorKey: "basePay",
    header: "Base Pay",
    cell: ({ row }) => {
      const amount = row.getValue("basePay") as number;
      return <span>${amount.toFixed(2)}</span>;
    },
  },
  {
    accessorKey: "minVideos",
    header: "Min Videos",
  },
  {
    accessorKey: "creatorCount",
    header: "Creators",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.getValue("creatorCount")}
      </span>
    ),
  },
  {
    accessorKey: "endDate",
    header: "Deadline",
    cell: ({ row }) => {
      const date = row.getValue("endDate") as Date;
      return (
        <span className="text-muted-foreground">
          {date.toLocaleDateString()}
        </span>
      );
    },
  },
];
