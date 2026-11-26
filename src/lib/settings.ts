export function getAttributionPhoneDays() {
  return Number(process.env.ATTRIBUTION_PHONE_DAYS || 30);
}

export function getDefaultCommissionRate() {
  return Number(process.env.DEFAULT_COMMISSION_RATE || 15);
}

export function isMockSms() {
  return process.env.MOCK_SMS !== "false";
}

export function getMockSmsCode() {
  return process.env.MOCK_SMS_CODE || "000000";
}

export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "https://cocos.kz";
}
