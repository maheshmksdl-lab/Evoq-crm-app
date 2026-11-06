"use client";
import { createContext, useContext, useState } from "react";

const SidebarContext = createContext<{
  mobileOpen: boolean;
  openMobile:  () => void;
  closeMobile: () => void;
}>({ mobileOpen: false, openMobile: () => {}, closeMobile: () => {} });

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <SidebarContext.Provider value={{
      mobileOpen,
      openMobile:  () => setMobileOpen(true),
      closeMobile: () => setMobileOpen(false),
    }}>
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => useContext(SidebarContext);
