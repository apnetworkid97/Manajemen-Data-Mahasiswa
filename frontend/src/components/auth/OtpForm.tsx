"use client";
import Link from "next/link";
import Swal from "sweetalert2";
import React, { useRef, useState } from "react";
import Label from "@/components/form/Label";

// Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
export default function OtpForm() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef<HTMLInputElement[]>([]);

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  const handleChange = (value: string, index: number) => {
    const updatedOtp = [...otp];
    updatedOtp[index] = value;

    // update status OTP dengan nilai yang baru dimasukkan
    setOtp(updatedOtp);

    // otomatis pindah ke input berikutnya jika ada nilai yang dimasukkan
    if (value && index < inputsRef.current.length - 1) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
    if (event.key === "Backspace") {
      const updatedOtp = [...otp];

      // jika input saat ini kosong, pindah ke input sebelumnya
      if (!otp[index] && index > 0) {
        inputsRef.current[index - 1].focus();
      }

      // hapus nilai pada input saat ini
      updatedOtp[index] = "";
      setOtp(updatedOtp);
    }

    // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
    if (event.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1].focus();
    }

    // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
    if (event.key === "ArrowRight" && index < inputsRef.current.length - 1) {
      inputsRef.current[index + 1].focus();
    }
  };

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();

    // ambil data yang dipaste dan potong menjadi array karakter, batasi hanya 6 karakter
    const pasteData = event.clipboardData.getData("text").slice(0, 6).split("");

    // Update OTP with the pasted data
    const updatedOtp = [...otp];
    pasteData.forEach((char, idx) => {
      // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
      if (idx < updatedOtp.length) {
        updatedOtp[idx] = char;
      }
    });

    setOtp(updatedOtp);

    // Focus the last filled input
    const filledIndex = pasteData.length - 1;
    // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
    if (inputsRef.current[filledIndex]) {
      inputsRef.current[filledIndex].focus();
    }
  };

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  const handleSubmit = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    void Swal.fire({
      icon: "success",
      title: "OTP Terkirim",
      text: `Submitted OTP: ${otp.join("")}`,
      confirmButtonColor: "#465fff",
    });
  };
  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="w-full max-w-md pt-10 mx-auto">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <svg
            className="stroke-current"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M12.7083 5L7.5 10.2083L12.7083 15.4167"
              stroke=""
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to dashboard
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            Two Step Verification
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            A verification code has been sent to your mobile. Please enter it in
            the field below.
          </p>
        </div>
        <div>
          <form>
            <div className="space-y-5">
              {/* <!-- Email --> */}
              <div>
                <Label>Type your 6 digits security code</Label>
                <div className="flex gap-2 sm:gap-4" id="otp-container">
                  {otp.map((_, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength={1}
                      value={otp[index]}
                      onChange={(e) => handleChange(e.target.value, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      onPaste={(e) => handlePaste(e)}
                      // ref={(el) => (inputsRef.current[index] = el!)} // Assign input refs
                      ref={(el) => {
                        // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
                        if (el) {
                          inputsRef.current[index] = el;
                        }
                      }}
                      className="dark:bg-dark-900 otp-input h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-center text-xl font-semibold text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    />
                  ))}
                </div>
              </div>

              {/* <!-- Button --> */}
              <div>
                <button
                  onClick={handleSubmit}
                  className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600"
                >
                  Verify My Account
                </button>
              </div>
            </div>
          </form>
          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
              Didn’t get the code?{" "}
              <Link
                href="/"
                className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Resend
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
