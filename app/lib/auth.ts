import { createHmac, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { RowDataPacket } from "mysql2";
import { getDb } from "./db";

const scryptAsync = promisify(scrypt);
const cookieName = "siswa-session";
const sessionDuration = 7 * 24 * 60 * 60;

type User = RowDataPacket & {
  id: number;
  username: string;
  password_hash: string;
};

type SessionUser = {
  id: number;
  username: string;
};

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || Buffer.byteLength(secret) < 32) {
    throw new Error("AUTH_SECRET belum diatur atau harus memiliki minimal 32 karakter.");
  }
  return secret;
}

export function isAuthSecretConfigured() {
  const secret = process.env.AUTH_SECRET;
  return Boolean(secret && Buffer.byteLength(secret) >= 32);
}

function sign(value: string) {
  return createHmac("sha256", getAuthSecret()).update(value).digest();
}

export async function verifyUser(username: string, password: string) {
  const [users] = await getDb().query<User[]>(
    "SELECT id, username, password_hash FROM users WHERE username = ? LIMIT 1",
    [username]
  );
  const user = users[0];
  if (!user) return null;

  const [format, saltHex, hashHex] = user.password_hash.split("$");
  if (
    format !== "scrypt" ||
    !/^[a-f0-9]{32}$/i.test(saltHex ?? "") ||
    !/^[a-f0-9]{128}$/i.test(hashHex ?? "")
  ) {
    throw new Error("Format password akun tidak valid.");
  }

  const expected = Buffer.from(hashHex, "hex");
  const actual = (await scryptAsync(password, Buffer.from(saltHex, "hex"), expected.length)) as Buffer;
  if (!timingSafeEqual(actual, expected)) return null;

  return { id: user.id, username: user.username };
}

export function createSessionToken(user: SessionUser) {
  const payload = Buffer.from(
    JSON.stringify({
      id: user.id,
      username: user.username,
      expiresAt: Math.floor(Date.now() / 1000) + sessionDuration,
    })
  ).toString("base64url");
  return `${payload}.${sign(payload).toString("base64url")}`;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return null;

  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra !== undefined) return null;

  const providedSignature = Buffer.from(signature, "base64url");
  const expectedSignature = sign(payload);
  if (
    providedSignature.length !== expectedSignature.length ||
    !timingSafeEqual(providedSignature, expectedSignature)
  ) {
    return null;
  }

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
      id?: unknown;
      username?: unknown;
      expiresAt?: unknown;
    };
    if (
      typeof session.id !== "number" ||
      !Number.isInteger(session.id) ||
      typeof session.username !== "string" ||
      typeof session.expiresAt !== "number" ||
      session.expiresAt <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }
    return { id: session.id, username: session.username };
  } catch {
    return null;
  }
}

export async function setSession(user: SessionUser) {
  (await cookies()).set(cookieName, createSessionToken(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: sessionDuration,
  });
}

export async function clearSession() {
  (await cookies()).delete(cookieName);
}

export async function requireSession() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}
