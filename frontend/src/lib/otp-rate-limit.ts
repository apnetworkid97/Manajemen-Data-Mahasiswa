const OTP_HISTORY_KEY = "mdm_otp_send_history";
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const OTP_DAILY_WINDOW_MS = 24 * 60 * 60 * 1000;
const OTP_DAILY_LIMIT = 3;

type OtpHistory = Record<string, number[]>;

function canUseStorage() {
  return typeof window !== "undefined";
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function readHistory(): OtpHistory {
  if (!canUseStorage()) {
    return {};
  }

  try {
    const rawHistory = localStorage.getItem(OTP_HISTORY_KEY);
    return rawHistory ? (JSON.parse(rawHistory) as OtpHistory) : {};
  } catch {
    localStorage.removeItem(OTP_HISTORY_KEY);
    return {};
  }
}

function saveHistory(history: OtpHistory) {
  if (!canUseStorage()) {
    return;
  }

  localStorage.setItem(OTP_HISTORY_KEY, JSON.stringify(history));
}

function getRecentHistory(email: string) {
  const history = readHistory();
  const emailKey = normalizeEmail(email);
  const now = Date.now();
  const recentHistory = (history[emailKey] || []).filter(
    (sentAt) => now - sentAt < OTP_DAILY_WINDOW_MS
  );

  saveHistory({
    ...history,
    [emailKey]: recentHistory,
  });

  return recentHistory;
}

export function getOtpLimitMessage(email: string) {
  const recentHistory = getRecentHistory(email);
  const lastSentAt = recentHistory[recentHistory.length - 1];
  const now = Date.now();

  if (lastSentAt && now - lastSentAt < OTP_RESEND_COOLDOWN_MS) {
    const waitSeconds = Math.ceil(
      (OTP_RESEND_COOLDOWN_MS - (now - lastSentAt)) / 1000
    );
    return `Tunggu ${waitSeconds} detik sebelum mengirim OTP lagi.`;
  }

  if (recentHistory.length >= OTP_DAILY_LIMIT) {
    return "Batas pengiriman OTP tercapai. Maksimal 3 kali dalam 24 jam.";
  }

  return "";
}

export function recordOtpSend(email: string) {
  const history = readHistory();
  const emailKey = normalizeEmail(email);
  const recentHistory = getRecentHistory(emailKey);

  saveHistory({
    ...history,
    [emailKey]: [...recentHistory, Date.now()],
  });
}
