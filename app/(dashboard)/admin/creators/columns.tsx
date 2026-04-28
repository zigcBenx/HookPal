"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

// This type matches the shape of data we'll SELECT from the database.
// We only include fields we need for the table — not the full user row.
export type CreatorRow = {
  id: string;
  name: string;
  email: string;
  status: "applied" | "active" | "rejected" | "terminated";
  country: string | null;
  createdAt: Date;
};

const statusVariant: Record<CreatorRow["status"], "default" | "secondary" | "destructive" | "outline"> = {
  applied: "outline",
  active: "default",
  rejected: "destructive",
  terminated: "secondary",
};

export const columns: ColumnDef<CreatorRow>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <Link
        href={`/admin/creators/${row.original.id}`}
        className="font-medium hover:underline"
      >
        {row.getValue("name")}
      </Link>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
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
    cell: ({ row }) => row.getValue("country") || "—",
  },
  {
    accessorKey: "createdAt",
    header: "Applied",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return date.toLocaleDateString();
    },
  },
];
