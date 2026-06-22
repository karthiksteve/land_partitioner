"use client";

import { useState } from "react";
import { usePlans } from "@/hooks/usePartition";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { TableLoading } from "@/components/ui/loading";
import { EmptyState } from "@/components/shared/EmptyState";
import { PlanCard } from "@/components/plans/PlanCard";
import { ComparisonTable } from "@/components/plans/ComparisonTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, FileText } from "lucide-react";

export default function PlansPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { data: plans, isLoading } = usePlans();

  const filteredPlans = (plans || []).filter((p) => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (search && !p.plan_type.toLowerCase().includes(search.toLowerCase()) && !p.description?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Partition Plans</h1>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search plans..."
                className="pl-9 w-64"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select
              options={[
                { value: "all", label: "All Status" },
                { value: "generated", label: "Generated" },
                { value: "approved", label: "Approved" },
                { value: "rejected", label: "Rejected" },
                { value: "draft", label: "Draft" },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <TableLoading />
        ) : filteredPlans.length > 0 ? (
          <Tabs defaultValue="grid">
            <TabsList>
              <TabsTrigger value="grid">Grid View</TabsTrigger>
              <TabsTrigger value="compare">Comparison</TabsTrigger>
            </TabsList>

            <TabsContent value="grid">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredPlans.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="compare">
              <ComparisonTable plans={filteredPlans} />
            </TabsContent>
          </Tabs>
        ) : (
          <EmptyState
            icon={<FileText className="h-16 w-16" />}
            title="No plans found"
            description="Generate partition plans from the Partition page."
          />
        )}
      </div>
    </DashboardLayout>
  );
}
