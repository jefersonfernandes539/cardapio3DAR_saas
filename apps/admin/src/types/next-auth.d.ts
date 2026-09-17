import "next-auth";
import "next-auth/jwt";

// Extend next-auth's Session/JWT with the tenant fields our authorize()
// callback returns (see src/lib/auth.ts).
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      restaurantId: string;
      role: string;
    };
  }

  interface User {
    id: string;
    restaurantId: string;
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    restaurantId: string;
    role: string;
  }
}
