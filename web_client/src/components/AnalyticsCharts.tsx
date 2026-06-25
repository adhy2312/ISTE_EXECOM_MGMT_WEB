"use client";

import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { EnergyPointRequest, EnergyPointStatus } from "@/types/models";

interface Props {
  requests: EnergyPointRequest[];
}

export function AnalyticsCharts({ requests }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null; // Avoid hydration mismatch on Recharts

  // Process data for Activity Over Time
  const timelineData = requests
    .filter(r => r.status === EnergyPointStatus.approved)
    .reduce((acc, req) => {
      const date = new Date(req.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const existing = acc.find(item => item.date === date);
      if (existing) {
        existing.points += req.awardedPoints || 0;
      } else {
        acc.push({ date, points: req.awardedPoints || 0 });
      }
      return acc;
    }, [] as { date: string; points: number }[])
    .reverse(); // Earliest to latest

  // Process data for Category Distribution
  const categoryData = requests
    .filter(r => r.status === EnergyPointStatus.approved)
    .reduce((acc, req) => {
      const existing = acc.find(item => item.category === req.category);
      if (existing) {
        existing.points += req.awardedPoints || 0;
      } else {
        acc.push({ category: req.category, points: req.awardedPoints || 0 });
      }
      return acc;
    }, [] as { category: string; points: number }[]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", marginTop: "24px" }}>
      
      {/* Timeline Chart */}
      <div className="glass-panel" style={{ padding: "20px" }}>
        <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "16px" }}>
          Energy Points Timeline
        </h3>
        <div style={{ height: 250 }}>
          {timelineData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--brand)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--brand)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: 'var(--brand)', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="points" stroke="var(--brand)" strokeWidth={3} fillOpacity={1} fill="url(#colorPoints)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)", fontSize: 13, fontWeight: 600 }}>
              Not enough data yet.
            </div>
          )}
        </div>
      </div>

      {/* Radar Chart */}
      <div className="glass-panel" style={{ padding: "20px" }}>
        <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "16px" }}>
          Category Distribution
        </h3>
        <div style={{ height: 250 }}>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={categoryData}>
                <PolarGrid stroke="var(--border-strong)" />
                <PolarAngleAxis dataKey="category" tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 700 }} />
                <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                <Radar name="Points" dataKey="points" stroke="#EA580C" strokeWidth={2} fill="#EA580C" fillOpacity={0.3} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: '#EA580C', fontWeight: 'bold' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)", fontSize: 13, fontWeight: 600 }}>
              Not enough data yet.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
