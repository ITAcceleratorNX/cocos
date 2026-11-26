import { cookies } from "next/headers";
import { createHash, timingSafeEqual } from "crypto";
import { prisma } from "./prisma";
import {
  ADMIN_COOKIE,
  SESSION_COOKIE,
  cookieMaxAgeDays,
  newToken,
} from "./cookies";
import { getMockSmsCode, isMockSms } from "./settings";

export function hashPassword(password: string) {
  return createHash("sha256").update(password).digest("hex");
}

export function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export async function createPartnerSession(partnerId: string) {
  const token = newToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: { partnerId, token, expiresAt } });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: cookieMaxAgeDays(30),
  });
  return token;
}

export async function getPartnerSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { token },
    include: { partner: true },
  });
  if (!session || session.expiresAt < new Date()) return null;
  return session;
}

export async function clearPartnerSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { token } });
    jar.delete(SESSION_COOKIE);
  }
}

export async function createAdminSession() {
  const jar = await cookies();
  const token = hashPassword(`${process.env.ADMIN_EMAIL}:${Date.now()}:${newToken()}`);
  jar.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: cookieMaxAgeDays(7),
  });
  // store as Setting for MVP validation
  await prisma.setting.upsert({
    where: { key: "admin_session" },
    create: { key: "admin_session", value: token },
    update: { value: token },
  });
  return token;
}

export async function getAdminSession() {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  const setting = await prisma.setting.findUnique({ where: { key: "admin_session" } });
  if (!setting || setting.value !== token) return null;
  return true;
}

export async function clearAdminSession() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
  await prisma.setting.deleteMany({ where: { key: "admin_session" } });
}

export function verifySmsCode(code: string) {
  if (isMockSms() && safeEqual(code, getMockSmsCode())) return true;
  return false;
}

export async function issueAuthCode(params: {
  phone?: string;
  email?: string;
  partnerId?: string;
}) {
  const code = isMockSms()
    ? getMockSmsCode()
    : String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await prisma.authCode.create({
    data: {
      phone: params.phone || "",
      email: params.email || null,
      code,
      expiresAt,
      partnerId: params.partnerId,
    },
  });
  return { code, expiresAt, displayCode: isMockSms() ? code : undefined };
}
