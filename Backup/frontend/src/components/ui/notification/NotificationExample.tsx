"use client";
import React from "react";
import Swal from "sweetalert2";
import ComponentCard from "@/components/common/ComponentCard";
import CookieConsent from "@/components/ui/notification/CookieConsent";
import UpdateNotification from "@/components/ui/notification/UpdateNotification";
import Notification from "./Notification";

// Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
function showInfo(title: string) {
  return Swal.fire({
    toast: true,
    position: "top-end",
    icon: "info",
    title,
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
  });
}

// Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
export default function NotificationExample() {
  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  const handleLater = () => {
    void showInfo("Later button clicked");
  };

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  const handleUpdate = () => {
    void showInfo("Update Now button clicked");
  };

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  const handleCookieSettings = () => {
    void showInfo("Cookie Settings clicked");
  };

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  const handleDenyAll = () => {
    void showInfo("Deny All clicked");
  };

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  const handleAcceptAll = () => {
    void showInfo("Accept All clicked");
  };
  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Announcement Banner */}
      <ComponentCard title="Announcement Bar">
        <UpdateNotification
          title="New update! Available"
          message="Enjoy improved functionality and enhancements."
          onLaterClick={handleLater}
          onUpdateClick={handleUpdate}
        />
      </ComponentCard>
      {/* Toast Banner */}
      <ComponentCard title="Toast Notification">
        <CookieConsent
          message="By Clicking on 'Accept', you agree to the storing of cookies on your device to enhance site navigation, analyze site usage, and assist in our marketing efforts."
          onCookieSettings={handleCookieSettings}
          onDenyAll={handleDenyAll}
          onAcceptAll={handleAcceptAll}
        />
      </ComponentCard>
      {/* Success */}
      <ComponentCard title="Success Notification">
        <Notification variant="success" title="Success! Action Completed!" />
      </ComponentCard>
      {/* Info */}
      <ComponentCard title="Info Notification">
        <Notification variant="info" title="Heads Up! New Information" />
      </ComponentCard>
      {/* Warning */}
      <ComponentCard title="Warning Notification">
        <Notification variant="warning" title="Alert: Double Check Required" />
      </ComponentCard>
      {/* Error */}
      <ComponentCard title="Error Notification">
        <Notification variant="error" title="Something Went Wrong" />
      </ComponentCard>
    </div>
  );
}
