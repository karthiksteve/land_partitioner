"use client";

import { useParcels } from "@/hooks/useParcels";
import { usePlans } from "@/hooks/usePartition";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableLoading } from "@/components/ui/loading";
import { ShareChart } from "@/components/charts/ShareChart";
import { ComparisonChart } from "@/components/charts/ComparisonChart";
import { Map, Split, Users, FileText, Plus, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { data: parcels, isLoading: parcelsLoading } = useParcels();
  const { data: plans } = usePlans();

  const activePlans = plans?.filter((p) => p.status === "generated" || p.status === "approved") || [];
  const pendingReview = plans?.filter((p) => p.status === "generated") || [];
  const totalOwners = parcels?.reduce((sum, p) => sum + (p.owners?.length || 0), 0) || 0;

  const statsCards = [
    {
      title: "Total Parcels",
      value: parcels?.length || 0,
      icon: <Map className="h-5 w-5" />,
      color: "text-blue-600",
      bg: "bg-blue-100 dark:bg-blue-950",
    },
    {
      title: "Active Plans",
      value: activePlans.length,
      icon: <Split className="h-5 w-5" />,
      color: "text-green-600",
      bg: "bg-green-100 dark:bg-green-950",
    },
    {
      title: "Pending Review",
      value: pendingReview.length,
      icon: <Clock className="h-5 w-5" />,
      color: "text-yellow-600",
      bg: "bg-yellow-100 dark:bg-yellow-950",
    },
    {
      title: "Total Owners",
      value: totalOwners,
      icon: <Users className="h-5 w-5" />,
      color: "text-purple-600",
      bg: "bg-purple-100 dark:bg-purple-950",
    },
  ];

  const quickActions = [
    { label: "New Parcel", href: "/parcels", icon: Plus },
    { label: "Generate Plan", href: "/partition", icon: Split },
    { label: "View Reports", href: "/reports", icon: FileText },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex gap-2">
            {quickActions.map((action) => (
              <Link key={action.label} href={action.href}>
                <Button variant="outline" size="sm" className="gap-2">
                  <action.icon className="h-4 w-4" />
                  {action.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.bg}`}>
                  <div className={stat.color}>{stat.icon}</div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">
                    {parcelsLoading ? "-" : stat.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Parcels */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Recent Parcels</CardTitle>
              <Link href="/parcels">
                <Button variant="ghost" size="sm" className="gap-1">
                  View All <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {parcelsLoading ? (
                <TableLoading />
              ) : parcels && parcels.length > 0 ? (
                <div className="space-y-3">
                  {parcels.slice(0, 5).map((parcel) => (
                    <Link
                      key={parcel.id}
                      href={`/parcels/${parcel.id}`}
                      className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                    >
                      <div>
                        <p className="text-sm font-medium">{parcel.parcel_id}</p>
                        <p className="text-xs text-muted-foreground">
                          {parcel.village}, {parcel.tehsil}
                        </p>
                      </div>
                      <Badge variant="secondary">{parcel.area} {parcel.area_unit}</Badge>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-8 text-center">No parcels yet</p>
              )}
            </CardContent>
          </Card>

          {/* Ownership Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ownership Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {parcels && parcels.length > 0 ? (
                <ShareChart
                  data={
                    parcels.slice(0, 6).map((p) => ({
                      name: p.parcel_id,
                      value: p.area,
                    }))
                  }
                  title="Parcel Area Distribution"
                />
              ) : (
                <p className="text-sm text-muted-foreground py-8 text-center">No data available</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Plan Scores Summary */}
        {plans && plans.length > 0 && (
          <ComparisonChart
            plans={plans.filter((p) => p.status !== "draft").map((p) => ({
              planType: p.plan_type,
              metrics: [
                { name: "Compactness", score: p.compactness_score, weight: 1, description: "" },
                { name: "Road Frontage", score: p.road_frontage_score, weight: 1, description: "" },
                { name: "Commercial", score: p.commercial_fairness_score, weight: 1, description: "" },
                { name: "Possession", score: p.possession_score, weight: 1, description: "" },
                { name: "Accessibility", score: p.accessibility_score, weight: 1, description: "" },
                { name: "Equity", score: p.equity_score, weight: 1, description: "" },
                { name: "Legal", score: p.legal_compliance_score, weight: 1, description: "" },
              ],
            }))}
            title="Plan Scores Summary"
          />
        )}
      </div>
    </DashboardLayout>
  );
}
