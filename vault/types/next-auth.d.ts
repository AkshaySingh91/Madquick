import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      kdfSalt: string; // expose salt to client; not secret
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    email: string;
    kdfSalt: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    kdfSalt: string;
  }
}

