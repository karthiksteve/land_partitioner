"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, Search, Map, FileText } from "lucide-react";

const publicNavLinks = [
  { label: "Home", href: "/" },
  { label: "Help", href: "/help" },
  { label: "Contact", href: "/contact" },
];

const authNavLinks = [
  { label: "Parcel Search", href: "/search", icon: Search },
  { label: "GIS Viewer", href: "/gis-viewer", icon: Map },
  { label: "Documents", href: "/documents", icon: FileText },
];

export default function GovHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Tricolor bar */}
      <div className="h-1 w-full bg-gradient-to-r from-gov-saffron via-white to-gov-green" />

      {/* Top bar */}
      <div className="bg-gov-blue-dark text-white text-xs py-1.5">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <span>भारत सरकार | GOVERNMENT OF INDIA</span>
          <div className="flex items-center gap-4">
            <select className="bg-transparent border border-white/30 rounded px-2 py-0.5 text-xs">
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="bg-gradient-to-r from-gov-header-start to-gov-header-end text-white shadow-gov">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo and title */}
            <Link href="/" className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gov-saffron flex items-center justify-center text-white font-bold text-lg">
                G
              </div>
              <div>
                <h1 className="text-lg font-bold leading-tight">GeoKurra</h1>
                <p className="text-xs text-blue-200 leading-tight">
                  Digital Land Information Portal
                </p>
              </div>
            </Link>

            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {publicNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded text-sm transition-colors ${
                    isActive(link.href)
                      ? "bg-white/20 text-white"
                      : "text-blue-200 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated &&
                authNavLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`px-3 py-2 rounded text-sm transition-colors flex items-center gap-1.5 ${
                        isActive(link.href)
                          ? "bg-white/20 text-white"
                          : "text-blue-200 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  );
                })}
            </nav>

            {/* Auth buttons / User menu */}
            <div className="hidden md:flex items-center gap-2">
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded text-sm text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <User className="h-4 w-4" />
                    <span>{user?.full_name || user?.username}</span>
                  </button>
                  {userMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 top-full mt-1 z-20 w-48 rounded-md border border-gov-border bg-white shadow-gov-lg">
                        <div className="px-4 py-2 border-b border-gov-border">
                          <p className="text-sm font-medium text-gov-text-dark">
                            {user?.full_name}
                          </p>
                          <p className="text-xs text-gov-text-light">
                            {user?.email}
                          </p>
                        </div>
                        <Link
                          href="/dashboard"
                          className="block px-4 py-2 text-sm text-gov-text-dark hover:bg-gov-gray"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gov-gray"
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="text-blue-200 hover:text-white hover:bg-white/10">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="saffron" size="sm">
                      Register
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-blue-200 hover:text-white"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-gov-border shadow-gov-lg">
          <div className="px-4 py-3 space-y-1">
            {publicNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 rounded text-sm ${
                  isActive(link.href)
                    ? "bg-gov-gray text-gov-blue font-medium"
                    : "text-gov-text-dark hover:bg-gov-gray"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated &&
              authNavLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2 rounded text-sm ${
                      isActive(link.href)
                        ? "bg-gov-gray text-gov-blue font-medium"
                        : "text-gov-text-dark hover:bg-gov-gray"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
            <div className="border-t border-gov-border pt-2 mt-2">
              {isAuthenticated ? (
                <>
                  <div className="px-3 py-2 text-sm text-gov-text-light">
                    {user?.full_name || user?.username}
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 rounded text-sm text-gov-text-dark hover:bg-gov-gray"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-2 rounded text-sm text-red-600 hover:bg-gov-gray"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex gap-2 px-3">
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)}>
                    <Button variant="saffron" size="sm">
                      Register
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
