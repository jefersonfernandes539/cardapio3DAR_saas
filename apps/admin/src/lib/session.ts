import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

/**
 * Server-side helper for Server Components/Route Handlers: returns the
 * signed-in session or redirects to /login. Every dashboard page and API
 * route uses this so all Prisma queries can be scoped to
 * `session.user.restaurantId` — never trusting a restaurantId from the client.
 */
export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return session;
}
