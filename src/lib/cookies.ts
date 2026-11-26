import { randomBytes } from "crypto";

export const PARTNER_COOKIE = "cocos_ref";
/** Referral code cookie (COCO001) — last-touch within visit */
export const REF_CODE_COOKIE = "cocos_ref_code";
export const VISITOR_COOKIE = "cocos_vid";
export const SESSION_COOKIE = "cocos_session";
export const ADMIN_COOKIE = "cocos_admin";

export const PARTNER_COOKIE_DAYS = 30;

export function cookieMaxAgeDays(days: number) {
  return days * 24 * 60 * 60;
}

export function newToken() {
  return randomBytes(32).toString("hex");
}
