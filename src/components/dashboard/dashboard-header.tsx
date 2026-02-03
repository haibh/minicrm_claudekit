"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  userName: string;
  userEmail: string;
}

export function DashboardHeader({ userName, userEmail }: DashboardHeaderProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-8">
      <div className="flex items-center space-x-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Welcome, {userName}
        </h2>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600">{userEmail}</span>
        <Button variant="outline" size="sm" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>
    </header>
  );
}
