"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

type SidebarContextType = {
  isExpanded: boolean;
  isMobileOpen: boolean;
  isHovered: boolean;
  activeItem: string | null;
  openSubmenu: string | null;
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  setIsHovered: (isHovered: boolean) => void;
  setActiveItem: (item: string | null) => void;
  toggleSubmenu: (item: string) => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

// Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  useEffect(() => {
    // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
      if (!mobile) {
        setIsMobileOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  const toggleSidebar = () => {
    setIsExpanded((prev) => !prev);
  };

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  const toggleMobileSidebar = () => {
    setIsMobileOpen((prev) => !prev);
  };
  const closeMobileSidebar = () => {
  setIsMobileOpen(false);
};
  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  const toggleSubmenu = (item: string) => {
    setOpenSubmenu((prev) => (prev === item ? null : item));
  };

  return (
    <SidebarContext.Provider
      value={{
        isExpanded: isMobile ? false : isExpanded,
        isMobileOpen,
        isHovered,
        activeItem,
        openSubmenu,
        toggleSidebar,
        toggleMobileSidebar,
        closeMobileSidebar,
        setIsHovered,
        setActiveItem,
        toggleSubmenu,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};
