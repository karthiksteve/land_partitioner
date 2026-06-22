"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { useParcels } from "@/hooks/useParcels";
import { usePlans } from "@/hooks/usePartition";
import { Shield, Users, Map, Split, Activity, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

const mockUsers = [
  { id: "1", name: "Admin User", email: "admin@geokurra.gov.in", role: "admin", status: "active", lastActive: "2024-01-15" },
  { id: "2", name: "Rajesh Singh", email: "rajesh@geokurra.gov.in", role: "revenue_officer", status: "active", lastActive: "2024-01-14" },
  { id: "3", name: "Amit Kumar", email: "amit@geokurra.gov.in", role: "surveyor", status: "active", lastActive: "2024-01-13" },
  { id: "4", name: "Priya Sharma", email: "priya@example.com", role: "citizen", status: "active", lastActive: "2024-01-12" },
];

const mockAuditLog = [
  { id: "1", user: "Admin User", action: "Approved Plan A for PAR-001", timestamp: "2024-01-15 10:30:00" },
  { id: "2", user: "Rajesh Singh", action: "Generated partition plans for PAR-002", timestamp: "2024-01-15 09:15:00" },
  { id: "3", user: "Amit Kumar", action: "Uploaded parcel geometry for PAR-003", timestamp: "2024-01-14 16:45:00" },
  { id: "4", user: "Priya Sharma", action: "Registered new parcel PAR-004", timestamp: "2024-01-14 14:20:00" },
];

export default function AdminPage() {
  const { data: parcels } = useParcels();
  const { data: plans } = usePlans();
  const { addToast } = useToast();

  const statsCards = [
    { label: "Total Users", value: mockUsers.length, icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Total Parcels", value: parcels?.length || 0, icon: Map, color: "text-green-600", bg: "bg-green-100" },
    { label: "Total Plans", value: plans?.length || 0, icon: Split, color: "text-purple-600", bg: "bg-purple-100" },
    { label: "Active Sessions", value: "12", icon: Activity, color: "text-yellow-600", bg: "bg-yellow-100" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <Badge variant="default" className="flex items-center gap-1">
            <Shield className="h-3 w-3" /> Admin
          </Badge>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="users">
          <TabsList>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" /> User Management
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <Clock className="h-4 w-4" /> Audit Log
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Activity className="h-4 w-4" /> System Stats
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.role === "admin"
                                ? "default"
                                : user.role === "revenue_officer"
                                ? "info"
                                : user.role === "surveyor"
                                ? "success"
                                : "secondary"
                            }
                          >
                            {user.role.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="success">{user.status}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{user.lastActive}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Select
                              options={[
                                { value: "admin", label: "Admin" },
                                { value: "revenue_officer", label: "Revenue Officer" },
                                { value: "surveyor", label: "Surveyor" },
                                { value: "citizen", label: "Citizen" },
                              ]}
                              value={user.role}
                              onChange={(e) => {
                                addToast(`Role updated for ${user.name}`, "success");
                              }}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Activity Audit Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockAuditLog.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 rounded-lg border p-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">{log.user}</span> {log.action}
                        </p>
                        <p className="text-xs text-muted-foreground">{log.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Parcels by Type</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Agricultural</span>
                    <span className="font-medium">{parcels?.filter((p) => p.land_type === "agricultural").length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Residential</span>
                    <span className="font-medium">{parcels?.filter((p) => p.land_type === "residential").length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Commercial</span>
                    <span className="font-medium">{parcels?.filter((p) => p.land_type === "commercial").length || 0}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Plans by Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Generated</span>
                    <span className="font-medium">{plans?.filter((p) => p.status === "generated").length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Approved</span>
                    <span className="font-medium">{plans?.filter((p) => p.status === "approved").length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rejected</span>
                    <span className="font-medium">{plans?.filter((p) => p.status === "rejected").length || 0}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">System Health</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">API Status</span>
                    <Badge variant="success">Healthy</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Database</span>
                    <Badge variant="success">Connected</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Storage</span>
                    <Badge variant="success">92% Free</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
