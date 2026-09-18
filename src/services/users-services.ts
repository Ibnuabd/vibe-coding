import { eq } from "drizzle-orm";
import { db } from "../db";
import { users, type NewUser } from "../db/schema";

export interface RegisterUserPayload {
  name: string;
  email: string;
  password: string;
}

export async function registerUser(payload: RegisterUserPayload) {
  // 1. Check if email already exists
  const existingUsers = await db
    .select()
    .from(users)
    .where(eq(users.email, payload.email))
    .limit(1);

  if (existingUsers.length > 0) {
    throw new Error("Email sudah terdaftar");
  }

  // 2. Hash password with bcrypt
  const hashedPassword = await Bun.password.hash(payload.password, {
    algorithm: "bcrypt",
    cost: 10,
  });

  // 3. Insert user into database
  await db.insert(users).values({
    name: payload.name,
    email: payload.email,
    password: hashedPassword,
  });

  return { data: "OK" };
}
