"use client";

import { createContext, useContext, useState, useCallback } from "react";

const SignInContext = createContext<{
  openSignIn: () => void;
  closeSignIn: () => void;
  isOpen: boolean;
}>({
  openSignIn: () => {},
  closeSignIn: () => {},
  isOpen: false,
});

export function SignInProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const openSignIn = useCallback(() => setIsOpen(true), []);
  const closeSignIn = useCallback(() => setIsOpen(false), []);

  return (
    <SignInContext.Provider value={{ openSignIn, closeSignIn, isOpen }}>
      {children}
    </SignInContext.Provider>
  );
}

export function useSignIn() {
  return useContext(SignInContext);
}
