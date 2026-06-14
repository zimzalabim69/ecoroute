"use client";

import { useSignIn } from "@/components/sign-in-context";

export function SignInButton({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const { openSignIn } = useSignIn();
  return (
    <button onClick={openSignIn} className={className}>
      {children}
    </button>
  );
}
