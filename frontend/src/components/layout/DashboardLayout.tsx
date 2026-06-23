"use client";

import GovHeader from "./GovHeader";
import GovFooter from "./GovFooter";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gov-gray">
      <GovHeader />
      <main className="flex-1">{children}</main>
      <GovFooter />
    </div>
  );
}
