"use client";
import { createContext, useContext, useState, useCallback } from "react";

const MenuCtx = createContext(null);

export function useMenu() {
  const ctx = useContext(MenuCtx);
  if (!ctx) throw new Error("useMenu must be used inside <MenuProvider>");
  return ctx;
}

export default function MenuProvider({ children }) {
  // Drawer (SideMenu)
  const [open, setOpen] = useState(false);
  const openMenu   = useCallback(() => setOpen(true), []);
  const closeMenu  = useCallback(() => setOpen(false), []);
  const toggleMenu = useCallback(() => setOpen(v => !v), []);

  // Account overlay
  const [accountOpen, setAccountOpen] = useState(false);
  const openAccount  = useCallback(() => setAccountOpen(true), []);
  const closeAccount = useCallback(() => setAccountOpen(false), []);
  const toggleAccount = useCallback(() => setAccountOpen(v => !v), []);

  // ✅ Logout overlay
  const [logoutOpen, setLogoutOpen] = useState(false);
  const openLogout  = useCallback(() => setLogoutOpen(true), []);
  const closeLogout = useCallback(() => setLogoutOpen(false), []);
  const toggleLogout = useCallback(() => setLogoutOpen(v => !v), []);

  const value = {
    // side menu
    open, openMenu, closeMenu, toggleMenu,
    // account overlay
    accountOpen, openAccount, closeAccount, toggleAccount,
    // logout overlay
    logoutOpen, openLogout, closeLogout, toggleLogout,
  };

  return <MenuCtx.Provider value={value}>{children}</MenuCtx.Provider>;
}
