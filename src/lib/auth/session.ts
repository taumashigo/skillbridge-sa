import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

/**
 * Get the current user's ID from the server-side session.
 * Use this in API routes to identify the logged-in user.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return (session?.user as any)?.id || null;
}

/**
 * Get the current user's email from the server-side session.
 */
export async function getCurrentUserEmail(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.email || null;
}

/**
 * Require authentication - throws if not logged in.
 * Returns the user ID.
 */
export async function requireAuth(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("UNAUTHORIZED");
  }
  return userId;
}
