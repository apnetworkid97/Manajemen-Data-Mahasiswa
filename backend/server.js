require("dotenv").config();

const http = require("node:http");
const { URL } = require("node:url");
const { StudentService } = require("./src/student-service");
const { AppError, ValidationError } = require("./src/errors");
const { OtpService } = require("./src/otp-service");

const PORT = process.env.PORT || 4000;
const studentService = new StudentService();
const otpService = new OtpService();

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  response.end(JSON.stringify(payload));
}

function sendText(response, statusCode, body, headers = {}) {
  response.writeHead(statusCode, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    ...headers,
  });
  response.end(body);
}

function parseRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk.toString();
    });

    request.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new ValidationError("Body request harus berformat JSON yang valid."));
      }
    });

    request.on("error", (error) => {
      reject(error);
    });
  });
}

function getIdFromPath(pathname) {
  const parts = pathname.split("/").filter(Boolean);
  return parts[2] || null;
}

async function handleRequest(request, response) {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const { pathname, searchParams } = url;

  if (request.method === "OPTIONS") {
    sendText(response, 204, "", {});
    return;
  }

  if (pathname === "/api/health" && request.method === "GET") {
    sendJson(response, 200, {
      success: true,
      message: "Backend Manajemen Data Mahasiswa aktif.",
      date: new Date().toISOString(),
    });
    return;
  }

  if (pathname === "/api/auth/send-otp" && request.method === "POST") {
    const body = await parseRequestBody(request);
    const email = String(body.email || "").trim();

    if (!email) {
      throw new ValidationError("Email wajib diisi.");
    }

    const result = await otpService.sendOtp(email);
    sendJson(response, 200, {
      success: true,
      message: "OTP berhasil dikirim ke email.",
      data: result,
    });
    return;
  }

  if (pathname === "/api/auth/verify-otp" && request.method === "POST") {
    const body = await parseRequestBody(request);
    const email = String(body.email || "").trim();
    const otp = String(body.otp || "").trim();

    if (!email || !otp) {
      throw new ValidationError("Email dan OTP wajib diisi.");
    }

    otpService.verifyOtp(email, otp);
    sendJson(response, 200, {
      success: true,
      message: "OTP valid. Email terverifikasi.",
    });
    return;
  }

  if (pathname === "/api/auth/consume-otp" && request.method === "POST") {
    const body = await parseRequestBody(request);
    const email = String(body.email || "").trim();

    if (!email) {
      throw new ValidationError("Email wajib diisi.");
    }

    otpService.assertVerified(email);
    sendJson(response, 200, {
      success: true,
      message: "OTP verification consumed.",
    });
    return;
  }

  if (pathname === "/api/students" && request.method === "GET") {
    const result = await studentService.listStudents({
      search: searchParams.get("search") || "",
      searchType: searchParams.get("searchType") || "sequential",
      sortBy: searchParams.get("sortBy") || "nim",
      sortOrder: searchParams.get("sortOrder") || "asc",
      sortMethod: searchParams.get("sortMethod") || "insertion",
    });

    sendJson(response, 200, { success: true, ...result });
    return;
  }

  if (pathname === "/api/students" && request.method === "POST") {
    const body = await parseRequestBody(request);
    const student = await studentService.createStudent(body);
    sendJson(response, 201, {
      success: true,
      message: "Data mahasiswa berhasil ditambahkan.",
      data: student,
    });
    return;
  }

  if (pathname === "/api/students/bulk-delete" && request.method === "POST") {
    const body = await parseRequestBody(request);
    const result = await studentService.deleteManyStudents(body.ids);
    sendJson(response, 200, {
      success: true,
      message: `${result.deletedCount} data mahasiswa berhasil dihapus.`,
      data: result.deletedStudents,
    });
    return;
  }

  if (pathname.startsWith("/api/students/") && request.method === "PUT") {
    const id = getIdFromPath(pathname);
    const body = await parseRequestBody(request);
    const student = await studentService.updateStudent(id, body);
    sendJson(response, 200, {
      success: true,
      message: "Data mahasiswa berhasil diperbarui.",
      data: student,
    });
    return;
  }

  if (pathname.startsWith("/api/students/") && request.method === "DELETE") {
    const id = getIdFromPath(pathname);
    const student = await studentService.deleteStudent(id);
    sendJson(response, 200, {
      success: true,
      message: `Data ${student.nama} berhasil dihapus.`,
      data: student,
    });
    return;
  }

  if (pathname === "/api/students/export" && request.method === "GET") {
    const format = searchParams.get("format") === "csv" ? "csv" : "json";
    const exported = await studentService.exportStudents(format);
    sendText(response, 200, exported.body, {
      "Content-Type": exported.contentType,
      "Content-Disposition": `attachment; filename="${exported.fileName}"`,
    });
    return;
  }

  if (pathname === "/api/students/import" && request.method === "POST") {
    const body = await parseRequestBody(request);
    const result = await studentService.importStudents(body.format, body.content);
    sendJson(response, 200, {
      success: true,
      message: `${result.imported} data mahasiswa berhasil diimport.`,
      data: result.students,
    });
    return;
  }

  sendJson(response, 404, {
    success: false,
    message: "Endpoint tidak ditemukan.",
  });
}

const server = http.createServer(async (request, response) => {
  try {
    await handleRequest(request, response);
  } catch (error) {
    if (error instanceof AppError) {
      sendJson(response, error.statusCode, {
        success: false,
        message: error.message,
      });
      return;
    }

    sendJson(response, 500, {
      success: false,
      message: `Terjadi kesalahan server: ${error.message}`,
    });
  }
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(
      `Port ${PORT} sedang dipakai proses lain. Tutup proses lama atau jalankan backend dengan PORT yang berbeda, misalnya: set PORT=4001 lalu npm run start`
    );
    process.exit(1);
  }

  console.error(`Gagal menjalankan backend: ${error.message}`);
  process.exit(1);
});

server.listen(PORT, async () => {
  await studentService.ensureStorage();
  console.log(`Backend berjalan di http://localhost:${PORT}`);
});
