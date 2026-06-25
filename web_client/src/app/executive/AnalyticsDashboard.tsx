"use client";

import { useMemo } from "react";
import { ExecomMember, Team, EnergyPointRequest, TaskItem, EnergyPointStatus, TaskState } from "@/types/models";
import { exportLeaderboardToCSV, exportPointLogsToCSV, exportTasksToCSV } from "@/lib/exportUtils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";
import { TrendingUp, Users, CheckSquare } from "lucide-react";

interface AnalyticsDashboardProps {
  members: ExecomMember[];
  teams: Team[];
  requests: EnergyPointRequest[];
  tasks: TaskItem[];
}

export function AnalyticsDashboard({ members, teams, requests, tasks }: AnalyticsDashboardProps) {
  
  // 1. Team Points Distribution Data
  const teamPointsData = useMemo(() => {
    return teams.map(team => {
      const teamMembers = members.filter(m => m.teamId === team.id);
      const totalPoints = teamMembers.reduce((sum, m) => sum + m.corePoints, 0);
      return {
        name: team.name,
        points: totalPoints,
        membersCount: teamMembers.length
      };
    }).sort((a, b) => b.points - a.points);
  }, [members, teams]);

  // 2. Task Status Data
  const taskStatusData = useMemo(() => {
    const active = tasks.filter(t => t.state !== TaskState.completed).length;
    const completed = tasks.filter(t => t.state === TaskState.completed).length;
    return [
      { name: "Active Tasks", value: active },
      { name: "Completed Tasks", value: completed }
    ];
  }, [tasks]);

  // 3. Weekly Engagement (Requests over last 4 weeks)
  const weeklyTrendData = useMemo(() => {
    const data: Record<string, { submitted: number, approved: number }> = {};
    const now = new Date();
    
    // Initialize last 4 weeks
    for (let i = 3; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - (i * 7));
      // Get week start string like "Oct 12"
      const weekStart = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      data[weekStart] = { submitted: 0, approved: 0 };
    }

    const weekKeys = Object.keys(data);
    
    requests.forEach(r => {
      const reqDate = new Date(r.submittedAt);
      // Find which week bucket it falls into
      const diffTime = Math.abs(now.getTime() - reqDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let weekIndex = 3 - Math.floor(diffDays / 7);
      if (weekIndex < 0) return; // Older than 4 weeks
      if (weekIndex > 3) weekIndex = 3;

      const key = weekKeys[weekIndex];
      if (key && data[key]) {
        data[key].submitted += 1;
        if (r.status === EnergyPointStatus.approved) {
          data[key].approved += 1;
        }
      }
    });

    return weekKeys.map(key => ({
      name: key,
      "Submitted Requests": data[key].submitted,
      "Approved Requests": data[key].approved,
    }));
  }, [requests]);


  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      
      {/* EXPORT CONTROLS */}
      <div className="glass-panel" style={{ padding: 20, display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 className="outfit-font" style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)" }}>Data Export</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 4 }}>Download reports for your offline records</p>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button onClick={() => exportLeaderboardToCSV(members, teams)} className="btn-secondary" style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 8, background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-primary)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
            <Users size={16} /> Leaderboard
          </button>
          <button onClick={() => exportPointLogsToCSV(requests)} className="btn-secondary" style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 8, background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-primary)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
            <TrendingUp size={16} /> Point Logs
          </button>
          <button onClick={() => exportTasksToCSV(tasks)} className="btn-secondary" style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 8, background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-primary)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
            <CheckSquare size={16} /> Task Metrics
          </button>
        </div>
      </div>

      {/* DASHBOARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
        
        {/* TEAM POINTS DISTRIBUTION */}
        <div className="glass-panel" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 20 }}>Team Performance (Total XP)</h3>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamPointsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "var(--text-secondary)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--text-secondary)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-primary)" }}
                  cursor={{ fill: "var(--bg-muted)" }}
                />
                <Bar dataKey="points" fill="var(--brand)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TASK COMPLETION STATUS */}
        <div className="glass-panel" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 20 }}>Task Status Overview</h3>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? "#F59E0B" : "#10B981"} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-primary)" }}
                />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 13, color: "var(--text-secondary)" }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* WEEKLY ENGAGEMENT TREND */}
        <div className="glass-panel" style={{ padding: 20, gridColumn: "1 / -1" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 20 }}>Weekly Engagement (Last 4 Weeks)</h3>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyTrendData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "var(--text-secondary)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--text-secondary)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-primary)" }}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 13, color: "var(--text-secondary)" }}/>
                <Line type="monotone" dataKey="Submitted Requests" stroke="#4338CA" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Approved Requests" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
