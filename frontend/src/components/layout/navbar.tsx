"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { clearAuthToken } from "@/lib/auth";

export function Navbar() {
  const router = useRouter();

  const onLogout = () => {
    clearAuthToken();
    router.replace("/login");
  };

  return (
    <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4">
      <h1 className="text-lg font-semibold">Dashboard</h1>
      <Button variant="outline" onClick={onLogout}>
        Logout
      </Button>
    </header>
  );
}
