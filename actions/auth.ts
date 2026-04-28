"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { signIn } from "@/lib/auth";
import { registerSchema, loginSchema } from "@/validators/auth";
import { AuthError } from "next-auth";

export async function register(values: {
  name: string;
  email: string;
  password: string;
}) {
  // 1. Validate the input
  const parsed = registerSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Invalid fields" };
  }

  const { name, email, password } = parsed.data;

  // 2. Check if email is already taken
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (existingUser) {
    return { error: "Email already in use" };
  }

  // 3. Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 4. Insert the new user (role defaults to "creator", status to "applied")
  await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
  });

  return { success: "Account created! Please log in." };
}

export async function login(values: { email: string; password: string }) {
  // 1. Validate the input
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Invalid fields" };
  }

  const { email, password } = parsed.data;

  // 2. Try to sign in via NextAuth
  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return { success: "Logged in!" };
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return { error: "Invalid email or password" };
      }
    }
    throw error;
  }
}
