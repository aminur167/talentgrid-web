"use client";
import React from 'react';
import {useSession } from "@/lib/auth-client";
import DashboardStats from "@/components/dashboard/DashboardStats";
import {
  FileText, 
  Persons, 
  Flame, 
  CircleCheck,
  Briefcase,
  Bookmark,
  Clock,
  Shield,
  PersonPlus
} from "@gravity-ui/icons"; 
const RecruiterDashboardHomePage = () => {
    const { data: session, isPending } = useSession();
        if (isPending) {
        return (
            <div className="flex h-full w-full items-center justify-center p-8">
                <p className="text-gray-400 animate-pulse">Loading dashboard...</p>
            </div>
        );
    }

    const recruiterStats = {
    recruiter: [
      { title: "Total Job Posts", value: "48", icon: FileText },
      { title: "Total Applicants", value: "1,284", icon: Persons },
      { title: "Active Jobs", value: "18", icon: Flame },
      { title: "Jobs Closed", value: "32", icon: CircleCheck },
    ]
  };

    const user = session?.user;
    return(
        <div>
            <h2 className="text-lg font-medium text-gray-300">
                Welcome, {user?.name}!
            </h2>
            <DashboardStats stats={recruiterStats.recruiter} />
        </div>
    );
};

export default RecruiterDashboardHomePage;