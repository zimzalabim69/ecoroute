"use client";

import { Navbar } from "@/components/navbar";
import { SignInModal } from "@/components/sign-in-modal";
import { SignInProvider, useSignIn } from "@/components/sign-in-context";

function ShellInner({ children }: { children: React.ReactNode }) {
  const { closeSignIn, isOpen } = useSignIn();

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <SignInModal isOpen={isOpen} onClose={closeSignIn} />
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SignInProvider>
      <ShellInner>{children}</ShellInner>
    </SignInProvider>
  );
}
