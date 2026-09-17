export { default } from "next-auth/middleware";

// Everything under /dashboard requires a logged-in restaurant owner/staff.
// The login page and public API routes (none exist here) stay unprotected.
export const config = {
  matcher: ["/dashboard/:path*"],
};
