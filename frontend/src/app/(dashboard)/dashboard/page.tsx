"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Search,
  Map,
  FileText,
  Clock,
  MapPin,
  Download,
} from "lucide-react";
import { formatDate } from "@/utils";

const recentSearches = [
  {
    id: "1",
    district: "Patna",
    plot_number: "123",
    mouza: "Maner",
    searched_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "2",
    district: "Gaya",
    plot_number: "456",
    mouza: "Bodh Gaya",
    searched_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "3",
    district: "Nalanda",
    plot_number: "789",
    mouza: "Biharsharif",
    searched_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const quickActions = [
    {
      title: "New Parcel Search",
      description: "Search for a land parcel",
      icon: Search,
      href: "/search",
      color: "text-gov-blue",
      bg: "bg-blue-50",
    },
    {
      title: "GIS Viewer",
      description: "View parcels on map",
      icon: Map,
      href: "/gis-viewer",
      color: "text-gov-green",
      bg: "bg-green-50",
    },
    {
      title: "Documents",
      description: "Access your documents",
      icon: FileText,
      href: "/documents",
      color: "text-gov-saffron",
      bg: "bg-orange-50",
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gov-text-dark">
            Welcome, {user?.full_name || user?.username}
          </h1>
          <p className="text-gov-text-light mt-1">
            GeoKurra Digital Land Information Portal Dashboard
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="gov-stat-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="gov-stat-value">0</div>
                <div className="gov-stat-label">Total Searches</div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                <Search className="h-6 w-6 text-gov-blue" />
              </div>
            </div>
          </div>

          <div className="gov-stat-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="gov-stat-value">0</div>
                <div className="gov-stat-label">Parcels Found</div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
                <MapPin className="h-6 w-6 text-gov-green" />
              </div>
            </div>
          </div>

          <div className="gov-stat-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="gov-stat-value">0</div>
                <div className="gov-stat-label">Documents Downloaded</div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center">
                <Download className="h-6 w-6 text-gov-saffron" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Searches */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Parcel Searches</CardTitle>
                    <CardDescription>Your recent search activity</CardDescription>
                  </div>
                  <Link href="/search">
                    <Button variant="outline" size="sm">
                      New Search
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>District</TableHead>
                      <TableHead>Plot No.</TableHead>
                      <TableHead>Mouza</TableHead>
                      <TableHead>Searched At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentSearches.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-gov-text-light py-8">
                          No recent searches. Start by searching a parcel.
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentSearches.map((search) => (
                        <TableRow key={search.id}>
                          <TableCell className="font-medium">
                            {search.district}
                          </TableCell>
                          <TableCell>{search.plot_number}</TableCell>
                          <TableCell>{search.mouza}</TableCell>
                          <TableCell>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-gov-text-light" />
                              {formatDate(search.searched_at)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Frequently used tools</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link key={action.title} href={action.href}>
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-gov-border hover:bg-gov-gray transition-colors cursor-pointer">
                        <div
                          className={`w-10 h-10 rounded-lg ${action.bg} flex items-center justify-center`}
                        >
                          <Icon className={`h-5 w-5 ${action.color}`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gov-text-dark">
                            {action.title}
                          </p>
                          <p className="text-xs text-gov-text-light">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
