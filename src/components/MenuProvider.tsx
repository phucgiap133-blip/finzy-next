"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

type MenuContextType = {
  open: boolean;
  openMenu: () => void;
  closeMenu: () => void;
  toggleMenu: () => void;
  accountOpen: boolean;
  openAccount: () => void;
  closeAccount: () => void;
  toggleAccount: () => void;
  logoutOpen: boolean;
  openLogout: () => void;
  closeLogout: () => void;
  toggleLogout: () => void;
};

const MenuCtx = createContext<MenuContextType | null>(null);

export function useMenu() {
  const ctx = useContext(MenuCtx);
  if (!ctx) throw new Error("useMenu must be used inside <MenuProvider>");
  return ctx;
}

export default function MenuProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const openMenu = useCallback(() => setOpen(true), []);
  const closeMenu = useCallback(() => setOpen(false), []);
  const toggleMenu = useCallback(() => setOpen((v) => !v), []);

  const openAccount = useCallback(() => setAccountOpen(true), []);
  const closeAccount = useCallback(() => setAccountOpen(false), []);
  const toggleAccount = useCallback(() => setAccountOpen((v) => !v), []);

  const openLogout = useCallback(() => setLogoutOpen(true), []);
  const closeLogout = useCallback(() => setLogoutOpen(false), []);
  const toggleLogout = useCallback(() => setLogoutOpen((v) => !v), []);

  const value: MenuContextType = {
    open,
    openMenu,
    closeMenu,
    toggleMenu,
    accountOpen,
    openAccount,
    closeAccount,
    toggleAccount,
    logoutOpen,
    openLogout,
    closeLogout,
    toggleLogout,
  };

  return <MenuCtx.Provider value={value}>{children}</MenuCtx.Provider>;
}
