import { requireAuth } from "@/lib/dal";

export default async function DashboardPage() {
  const user = await requireAuth();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Welcome, {user.name}! You are logged in as <strong>{user.role}</strong>.
      </p>
    </div>
  );
}
