"use client";

import { Users, Calendar, DollarSign, Activity } from "lucide-react";
import { StatCard } from "@/components/organizer/stat-card";

export function PlatformStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard 
        title="Total Volume" 
        value="4,291 ETH" 
        change="+18.2%" 
        trend="up"
        icon={<DollarSign className="h-6 w-6" />}
      />
      <StatCard 
        title="Total Users" 
        value="12,504" 
        change="+5.4%" 
        trend="up"
        icon={<Users className="h-6 w-6" />}
      />
      <StatCard 
        title="Total Events" 
        value="892" 
        change="+2.1%" 
        trend="up"
        icon={<Calendar className="h-6 w-6" />}
      />
      <StatCard 
        title="Active Listings" 
        value="3,402" 
        change="-0.5%" 
        trend="down"
        icon={<Activity className="h-6 w-6" />}
      />
    </div>
  );
}
