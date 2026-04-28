import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role: "admin" | "creator";
    status: "applied" | "active" | "rejected" | "terminated";
  }

  interface Session {
    user: {
      id: string;
      role: "admin" | "creator";
      status: "applied" | "active" | "rejected" | "terminated";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "admin" | "creator";
    status: "applied" | "active" | "rejected" | "terminated";
  }
}
