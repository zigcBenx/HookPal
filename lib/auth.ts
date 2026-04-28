import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users, accounts, sessions, verificationTokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import { loginSchema } from "@/validators/auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Connect NextAuth to our database via Drizzle
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),

  // Use JWT tokens stored in cookies (not database sessions)
  session: { strategy: "jwt" },

  // Custom pages — NextAuth won't generate default ones
  pages: {
    signIn: "/login",
  },

  // Credentials provider: email + password login
  providers: [
    Credentials({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },

      // This function runs when a user tries to log in.
      // It receives the credentials and must return a user object or null.
      async authorize(credentials) {
        // 1. Validate the input shape
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        // 2. Find the user in the database
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email));

        // 3. No user found, or user has no password (OAuth-only account)
        if (!user || !user.password) return null;

        // 4. Compare the provided password with the stored hash
        const passwordsMatch = await bcrypt.compare(password, user.password);
        if (!passwordsMatch) return null;

        // 5. Return the user object — this gets passed to the jwt callback
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          image: user.image,
        };
      },
    }),
  ],

  callbacks: {
    // Called whenever a JWT is created or updated.
    // We use it to put role and status INTO the token.
    async jwt({ token, user }) {
      if (user) {
        // 'user' is only available on initial sign-in
        token.id = user.id!;
        token.role = user.role;
        token.status = user.status;
      }
      return token;
    },

    // Called whenever a session is checked (useSession, auth(), etc).
    // We use it to expose role and status FROM the token to the session.
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.status = token.status;
      return session;
    },
  },
});
