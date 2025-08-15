import { getDashBoardData } from "@/actions/admin";
import React from "react";
import Dashboard from "./_components/dashboard";

export const metadata = {
  title: "Dashboard | Vehiql Admin",
  description: "Admin dashboard for Vehiql car marketplace",
};

export default async function AdminDashboardPage() {
  // Fetch dashboard data
  const dashboardData = await getDashBoardData();

  return (
    <div className="p-6">
      <h1 className="text-2xl fnot-bold mb-6">Dashboard</h1>
      <Dashboard initialData={dashboardData} />
    </div>
  );
}
