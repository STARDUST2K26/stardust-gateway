import { useSession } from "@tanstack/react-start/server";

const ITERATIONS = 100_000;

function toHex(buf: ArrayBuffer) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function fromHex(hex: string) {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

async function derive(password: string, salt: Uint8Array) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt as unknown as BufferSource, iterations: ITERATIONS, hash: "SHA-256" },
    key,
    256,
  );
  return toHex(bits);
}

export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return `${toHex(salt.buffer)}:${await derive(password, salt)}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [saltHex, expected] = stored.split(":");
  if (!saltHex || !expected) return false;
  const actual = await derive(password, fromHex(saltHex));
  if (actual.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < actual.length; i++) diff |= actual.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

export type AdminSession = { admin?: boolean };

export function getAdminSession() {
  const secret =
    process.env["ADMIN_SESSION_SECRET"] ||
    "stardust_admin_session_secret_key_32_characters_minimum_security";
  const isProd = process.env.NODE_ENV === "production";
  return useSession<AdminSession>({
    password: secret,
    name: "interstellar-admin",
    maxAge: 60 * 60 * 8,
    cookie: { httpOnly: true, secure: isProd, sameSite: "lax" as const, path: "/" },
  });
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session.data.admin) throw new Error("Unauthorized");
  return session;
}
