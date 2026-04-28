"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";

export type CreatorRow = {
  id: string;
  name: string;
  email: string;
  status: "applied" | "active" | "rejected" | "terminated";
  country: string | null;
  createdAt: Date;
};

const statusVariant: Record<
  CreatorRow["status"],
  "default" | "secondary" | "destructive" | "outline"
> = {
  applied: "outline",
  active: "default",
  rejected: "destructive",
  terminated: "secondary",
};

export const columns: ColumnDef<CreatorRow>[] = [
  {
    accessorKey: "name",
    header: "Creator",
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

      return (
        <Link
          href={`/admin/creators/${row.original.id}`}
          className="flex items-center gap-3 hover:opacity-80"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium">{name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {row.original.email}
            </p>
          </div>
        </Link>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as CreatorRow["status"];
      return <Badge variant={statusVariant[status]}>{status}</Badge>;
    },
  },
  {
    accessorKey: "country",
    header: "Country",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.getValue("country") || "—"}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Applied",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return (
        <span className="text-muted-foreground">
          {date.toLocaleDateString()}
        </span>
      );
    },
  },
];
