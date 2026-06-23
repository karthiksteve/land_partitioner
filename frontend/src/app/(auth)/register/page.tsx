"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Globe } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("citizen");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const roleOptions = [
    { value: "citizen", label: "Citizen" },
    { value: "officer", label: "Government Officer" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError("Full name is required");
      return;
    }
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!username.trim()) {
      setError("Username is required");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await register({
        full_name: fullName,
        email,
        username,
        password,
        role,
      });
      router.push("/login?registered=true");
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as {
          response?: { data?: { detail?: string } };
        };
        setError(
          axiosErr.response?.data?.detail || "Registration failed. Please try again."
        );
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gov-gray px-4 py-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gov-blue flex items-center justify-center">
              <Globe className="h-8 w-8 text-gov-saffron" />
            </div>
          </div>
          <CardTitle className="text-xl">Create Account</CardTitle>
          <CardDescription>
            Register for GeoKurra Digital Land Information Portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gov-text-dark mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gov-text-dark mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gov-text-dark mb-1">
                Username <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gov-text-dark mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <Input
                type="password"
                placeholder="Create a password (min. 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gov-text-dark mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <Input
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gov-text-dark mb-1">
                Role
              </label>
              <Select
                options={roleOptions}
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={loading}
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="saffron"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Registering...
                </span>
              ) : (
                "Register"
              )}
            </Button>

            <p className="text-center text-sm text-gov-text-light">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-gov-blue hover:underline font-medium"
              >
                Sign in here
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
