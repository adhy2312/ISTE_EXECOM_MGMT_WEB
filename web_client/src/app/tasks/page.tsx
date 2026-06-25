"use client";

import { useEffect, useRef, useState } from "react";
import { useTasksStore } from "@/store/tasks";
import { TaskState, TaskPriority } from "@/types/models";
import gsap from "gsap";
import { CheckSquare, Clock, AlertCircle, PlayCircle, CheckCircle2 } from "lucide-react";

export default function TasksPage() {
  const { tasks, isLoading, fetchTasks } = useTasksStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<TaskState | 'all'>('all');

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    if (!isLoading && tasks.length > 0 && containerRef.current) {
      const taskCards = containerRef.current.querySelectorAll(".task-card");
      gsap.fromTo(
        taskCards,
        { y: 20, opacity: 0, scale: 0.98 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.4,
          stagger: 0.05,
          ease: "power2.out",
        }
      );
    }
  }, [isLoading, tasks, activeTab]);

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <div style={{ border: "3px solid var(--border)", borderTopColor: "var(--brand)", borderRadius: "50%", width: "32px", height: "32px", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  const getPriorityColor = (p: TaskPriority) => {
    switch (p) {
      case TaskPriority.critical: return { text: "#DC2626", bg: "rgba(220, 38, 38, 0.1)" };
      case TaskPriority.high: return { text: "#D97706", bg: "rgba(217, 119, 6, 0.1)" };
      case TaskPriority.medium: return { text: "#2563EB", bg: "rgba(37, 99, 235, 0.1)" };
      default: return { text: "var(--text-secondary)", bg: "var(--bg-muted)" };
    }
  };

  const getStateBadge = (s: TaskState) => {
    switch (s) {
      case TaskState.completed: return { label: "Done", color: "#059669", bg: "rgba(5, 150, 105, 0.1)", icon: <CheckCircle2 size={12} /> };
      case TaskState.inProgress: return { label: "Doing", color: "#2563EB", bg: "rgba(37, 99, 235, 0.1)", icon: <PlayCircle size={12} /> };
      case TaskState.underReview: return { label: "Review", color: "#D97706", bg: "rgba(217, 119, 6, 0.1)", icon: <AlertCircle size={12} /> };
      default: return { label: "Todo", color: "var(--text-secondary)", bg: "var(--bg-muted)", icon: <CheckSquare size={12} /> };
    }
  };

  const filteredTasks = activeTab === 'all' ? tasks : tasks.filter(t => t.state === activeTab);

  const tabs = [
    { id: 'all', label: 'All' },
    { id: TaskState.pending, label: 'Todo' },
    { id: TaskState.inProgress, label: 'Doing' },
    { id: TaskState.completed, label: 'Done' }
  ];

  return (
    <div ref={containerRef} style={{ paddingBottom: "100px", padding: "20px 20px 100px", maxWidth: 700, margin: "0 auto" }}>
      <header style={{ marginBottom: "2rem" }}>
        <h1 className="outfit-font" style={{ fontSize: "28px", fontWeight: "800", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--brand-glow)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CheckSquare color="var(--brand)" size={20} strokeWidth={2.5} />
          </div>
          Task Matrix
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "8px", fontWeight: 500 }}>Manage assignments and deadlines</p>
      </header>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "12px", marginBottom: "16px", scrollbarWidth: "none" }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TaskState | 'all')}
            style={{
              padding: "10px 18px",
              borderRadius: "12px",
              border: activeTab === tab.id ? `1.5px solid var(--brand)` : `1px solid var(--border)`,
              background: activeTab === tab.id ? 'var(--brand-glow)' : 'var(--bg-elevated)',
              color: activeTab === tab.id ? 'var(--brand)' : 'var(--text-secondary)',
              fontWeight: "700",
              fontSize: "13px",
              cursor: "pointer",
              transition: "all 0.2s",
              whiteSpace: "nowrap",
              boxShadow: activeTab === tab.id ? "0 4px 10px rgba(79, 70, 229, 0.1)" : "none"
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {filteredTasks.length === 0 && (
          <div className="glass-panel" style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-secondary)", border: "1px dashed var(--border-strong)" }}>
            <CheckCircle2 size={40} style={{ margin: "0 auto 12px", opacity: 0.3 }} strokeWidth={1.5} />
            <div style={{ fontSize: 16, fontWeight: 600 }}>No tasks in this category</div>
          </div>
        )}
        {filteredTasks.map(task => {
          const state = getStateBadge(task.state);
          const priority = getPriorityColor(task.priority);
          return (
            <div key={task.id} className="task-card glass-panel" style={{ padding: "20px", border: "1px solid var(--border)", transition: "box-shadow 0.2s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", flex: 1, color: "var(--text-primary)", lineHeight: 1.3 }}>{task.title}</h3>
                <div style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "6px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: "800", textTransform: "uppercase",
                  backgroundColor: state.bg, color: state.color, marginLeft: 16
                }}>
                  {state.icon} {state.label}
                </div>
              </div>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "20px", lineHeight: 1.6 }}>
                {task.description}
              </p>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: priority.text, backgroundColor: priority.bg, padding: '6px 12px', borderRadius: '8px' }}>
                  <AlertCircle size={14} />
                  <span>{task.priority}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)", backgroundColor: 'var(--bg-muted)', padding: '6px 12px', borderRadius: '8px' }}>
                  <Clock size={14} />
                  <span>{new Date(task.targetDeadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ marginTop: "24px", height: "8px", backgroundColor: "var(--bg-muted)", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ 
                  height: "100%", width: `${task.progressPercentage}%`, 
                  background: "linear-gradient(90deg, var(--brand), #4338CA)",
                  borderRadius: "4px", transition: "width 0.4s ease"
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
