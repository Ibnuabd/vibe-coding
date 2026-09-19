import { eq } from "drizzle-orm";
import { db } from "../db";
import { users, sessions, type NewUser } from "../db/schema";

export interface RegisterUserPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginUserPayload {
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

export async function loginUser(payload: LoginUserPayload) {
  // 1. Check if user exists
  const existingUsers = await db
    .select()
    .from(users)
    .where(eq(users.email, payload.email))
    .limit(1);

  const user = existingUsers[0];
  if (!user) {
    throw new Error("Email atau password salah");
  }

  // 2. Verify password
  const isPasswordValid = await Bun.password.verify(
    payload.password,
    user.password,
    "bcrypt"
  );

  if (!isPasswordValid) {
    throw new Error("Email atau password salah");
  }

  // 3. Generate session token
  const token = crypto.randomUUID();

  // 4. Save session to database
  await db.insert(sessions).values({
    token,
    user_id: user.id,
  });

  return { data: token };
}

export async function getCurrentUser(token: string) {
  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      create_at: users.create_at,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.user_id, users.id))
    .where(eq(sessions.token, token))
    .limit(1);

  const sessionUser = result[0];
  if (!sessionUser) {
    throw new Error("Unauthorized");
  }

  return {
    data: {
      id: sessionUser.id,
      name: sessionUser.name,
      email: sessionUser.email,
      create_at: sessionUser.create_at,
    },
  };
}

export async function logoutUser(token: string) {
  // 1. Check if session exists
  const existingSessions = await db
    .select()
    .from(sessions)
    .where(eq(sessions.token, token))
    .limit(1);

  const session = existingSessions[0];
  if (!session) {
    throw new Error("Unauthorized");
  }

  // 2. Delete session
  await db.delete(sessions).where(eq(sessions.token, token));

  return { data: "OK" };
}

