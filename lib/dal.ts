import { auth } from "@/lib/auth";
import { cache } from "react";

// Get the current user's session. Returns null if not logged in.
// cache() ensures this only runs once per request, even if called
// from multiple server components on the same page.
export const getCurrentUser = cache(async () => {
  const session = await auth();
  if (!session?.user) return null;
  return session.user;
});

// Require authentication. Throws unauthorized() if not logged in.
export const requireAuth = cache(async () => {
  const user = await getCurrentUser();
  if (!user) {
    const { unauthorized } = await import("next/navigation");
    return unauthorized();
  }
  return user;
});

// Require admin role. Throws forbidden() if not admin.
export const requireAdmin = cache(async () => {
  const user = await getCurrentUser();
  if (!user) {
    const { unauthorized } = await import("next/navigation");
    return unauthorized();
  }
  if (user.role !== "admin") {
    const { forbidden } = await import("next/navigation");
    return forbidden();
  }
  return user;
});
