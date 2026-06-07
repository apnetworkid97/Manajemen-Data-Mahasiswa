const nodemailer = require("nodemailer");
const { RateLimitError, ValidationError } = require("./errors");

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const OTP_DAILY_WINDOW_MS = 24 * 60 * 60 * 1000;
const OTP_DAILY_LIMIT = 3;

class OtpService {
  constructor() {
    this.otpStore = new Map();
    this.sendHistory = new Map();
  }

  ensureSmtpConfig() {
    const required = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "SMTP_FROM"];
    const missing = required.filter((key) => !process.env[key]);

    if (missing.length > 0) {
      throw new ValidationError(
        `Konfigurasi SMTP belum lengkap. Lengkapi env: ${missing.join(", ")}`
      );
    }
  }

  createTransporter() {
    this.ensureSmtpConfig();

    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  generateOtpCode() {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
  }

  getRecentSendHistory(emailKey) {
    const now = Date.now();
    const recentHistory = (this.sendHistory.get(emailKey) || []).filter(
      (sentAt) => now - sentAt < OTP_DAILY_WINDOW_MS
    );

    this.sendHistory.set(emailKey, recentHistory);
    return recentHistory;
  }

  assertCanSendOtp(emailKey) {
    const now = Date.now();
    const recentHistory = this.getRecentSendHistory(emailKey);
    const lastSentAt = recentHistory[recentHistory.length - 1];

    if (lastSentAt && now - lastSentAt < OTP_RESEND_COOLDOWN_MS) {
      const waitSeconds = Math.ceil((OTP_RESEND_COOLDOWN_MS - (now - lastSentAt)) / 1000);
      throw new RateLimitError(
        `Tunggu ${waitSeconds} detik sebelum mengirim OTP lagi.`
      );
    }

    if (recentHistory.length >= OTP_DAILY_LIMIT) {
      throw new RateLimitError(
        "Batas pengiriman OTP tercapai. Maksimal 3 kali dalam 24 jam."
      );
    }
  }

  recordOtpSend(emailKey) {
    const recentHistory = this.getRecentSendHistory(emailKey);
    this.sendHistory.set(emailKey, [...recentHistory, Date.now()]);
  }

  async sendOtp(email) {
    if (!email || typeof email !== "string") {
      throw new ValidationError("Email tujuan OTP tidak valid.");
    }

    const emailKey = this.normalizeEmail(email);
    this.assertCanSendOtp(emailKey);

    const code = this.generateOtpCode();
    const expiresAt = Date.now() + OTP_EXPIRY_MS;
    const transporter = this.createTransporter();

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: "Kode OTP Registrasi Manajemen Data Mahasiswa",
      text: `Kode OTP Anda adalah ${code}. Kode berlaku 5 menit.`,
      html: `<p>Kode OTP Anda adalah <b>${code}</b>.</p><p>Kode berlaku 5 menit.</p>`,
    });

    this.recordOtpSend(emailKey);
    this.otpStore.set(emailKey, {
      code,
      expiresAt,
      verified: false,
    });

    return {
      expiresAt,
    };
  }

  verifyOtp(email, code) {
    const key = this.normalizeEmail(email);
    const payload = this.otpStore.get(key);

    if (!payload) {
      throw new ValidationError("OTP belum pernah dikirim ke email ini.");
    }

    if (Date.now() > payload.expiresAt) {
      this.otpStore.delete(key);
      throw new ValidationError("OTP sudah kadaluarsa. Silakan kirim ulang OTP.");
    }

    if (String(code) !== payload.code) {
      throw new ValidationError("Kode OTP salah.");
    }

    payload.verified = true;
    this.otpStore.set(key, payload);
  }

  assertVerified(email) {
    const key = this.normalizeEmail(email);
    const payload = this.otpStore.get(key);

    if (!payload || !payload.verified) {
      throw new ValidationError("Email belum terverifikasi OTP.");
    }

    this.otpStore.delete(key);
  }
}

module.exports = {
  OtpService,
};
