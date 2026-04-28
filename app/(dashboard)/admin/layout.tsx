import { requireAdmin } from "@/lib/dal";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This runs on the server before any admin page renders.
  // If the user isn't an admin, requireAdmin() triggers forbidden().
  await requireAdmin();

  return <>{children}</>;
}
