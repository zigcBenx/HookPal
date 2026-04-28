import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";

export default async function CreatorsPage() {

  const creators = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      status: users.status,
      country: users.country,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.role, "creator"));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Creators</h1>
        <p className="text-muted-foreground">
          Manage creator applications and accounts.
        </p>
      </div>

      <DataTable columns={columns} data={creators} />
    </div>
  );
}
