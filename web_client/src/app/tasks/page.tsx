"use client";

import { useEffect, useRef, useMemo } from "react";
import { useTasksStore } from "@/store/tasks";
import { useAuthStore } from "@/store/auth";
import { TaskState, TaskPriority, UserRole, ROOT_ADMINS } from "@/types/models";
import { motion, AnimatePresence } from "framer-motion";
import { CheckSquare, Clock, AlertCircle, PlayCircle, CheckCircle2, MoreHorizontal, ArrowRight, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { isRootOrChapterAdmin } from "@/utils/permissions";

const COLUMNS = [
  { id: TaskState.pending, label: "To Do", icon: CheckSquare, color: "var(--text-secondary)", bg: "var(--bg-muted)" },
  { id: TaskState.inProgress, label: "In Progress", icon: PlayCircle, color: "#2563EB", bg: "rgba(37, 99, 235, 0.1)" },
  { id: TaskState.underReview, label: "In Review", icon: AlertCircle, color: "#D97706", bg: "rgba(217, 119, 6, 0.1)" },
  { id: TaskState.completed, label: "Completed", icon: CheckCircle2, color: "#059669", bg: "rgba(5, 150, 105, 0.1)" },
];

export default function KanbanPage() {
  const { tasks, isLoading, fetchTasks, updateTaskState } = useTasksStore();
  const { user } = useAuthStore();
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const filteredTasks = useMemo(() => {
    if (!user) return [];
    const isAdmin = isRootOrChapterAdmin(user);
    if (isAdmin) return tasks;
    return tasks.filter(t => t.teamId === user.teamId || t.assignedMemberId === user.id);
  }, [tasks, user]);

  const getPriorityColor = (p: TaskPriority) => {
    switch (p) {
      case TaskPriority.critical: return { text: "#DC2626", bg: "rgba(220, 38, 38, 0.1)" };
      case TaskPriority.high: return { text: "#D97706", bg: "rgba(217, 119, 6, 0.1)" };
      case TaskPriority.medium: return { text: "#2563EB", bg: "rgba(37, 99, 235, 0.1)" };
      default: return { text: "var(--text-secondary)", bg: "var(--bg-muted)" };
    }
  };

  const getNextState = (current: TaskState): TaskState | null => {
    const idx = COLUMNS.findIndex(c => c.id === current);
    return idx < COLUMNS.length - 1 ? COLUMNS[idx + 1].id : null;
  };

  const getPrevState = (current: TaskState): TaskState | null => {
    const idx = COLUMNS.findIndex(c => c.id === current);
    return idx > 0 ? COLUMNS[idx - 1].id : null;
  };

  if (isLoading) {
    return (
      <div style={{ padding: "40px 20px 100px", maxWidth: 1400, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>
        <Skeleton height={60} width={300} borderRadius={16} />
        <div style={{ display: "flex", gap: 24, overflowX: "auto" }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ minWidth: 320, flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
              <Skeleton height={40} borderRadius={12} />
              <Skeleton height={150} borderRadius={16} />
              <Skeleton height={150} borderRadius={16} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px 20px 100px", maxWidth: 1400, margin: "0 auto", display: "flex", flexDirection: "column", height: "100vh" }}>
      
      {/* Header section */}
      <header className="mobile-col" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20, marginBottom: 32 }}>
        <div>
          <h1 className="outfit-font" style={{ fontSize: "36px", fontWeight: "800", color: "var(--text-primary)", marginBottom: 8 }}>
            Task Board
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "16px", fontWeight: "500" }}>
            Manage assignments across the pipeline
          </p>
        </div>
      </header>

      {/* Kanban Board */}
      <div 
        ref={boardRef}
        style={{ 
          display: "flex", gap: 24, flex: 1, overflowX: "auto", overflowY: "hidden", 
          paddingBottom: 24, scrollbarWidth: "thin", scrollbarColor: "var(--border) transparent" 
        }}
      >
        {COLUMNS.map((col) => {
          const columnTasks = filteredTasks.filter(t => t.state === col.id);
          const ColIcon = col.icon;
          
          return (
            <div key={col.id} style={{ 
              minWidth: 320, width: 320, flexShrink: 0, 
              display: "flex", flexDirection: "column", gap: 16,
              background: "rgba(20, 20, 30, 0.4)", borderRadius: 24, padding: "20px 16px",
              border: "1px solid var(--border)"
            }}>
              
              {/* Column Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, padding: "0 8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ color: col.color, background: col.bg, padding: 6, borderRadius: 8 }}>
                    <ColIcon size={16} strokeWidth={2.5} />
                  </div>
                  <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)" }}>{col.label}</h2>
                </div>
                <div style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", fontSize: 13, fontWeight: 700, padding: "2px 8px", borderRadius: 12 }}>
                  {columnTasks.length}
                </div>
              </div>

              {/* Tasks List */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1, overflowY: "auto", padding: "0 4px" }}>
                <AnimatePresence>
                  {columnTasks.map((task) => {
                    const priority = getPriorityColor(task.priority);
                    const nextState = getNextState(task.state);
                    const prevState = getPrevState(task.state);

                    return (
                      <motion.div
                        layout
                        layoutId={task.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        key={task.id} 
                        className="glass-panel" 
                        style={{ 
                          padding: "16px", border: "1px solid var(--border-strong)", 
                          cursor: "grab", position: "relative",
                          boxShadow: "var(--shadow-sm)"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: priority.text, backgroundColor: priority.bg, padding: '4px 8px', borderRadius: '6px', fontSize: 11, fontWeight: 800, textTransform: "uppercase" }}>
                            <AlertCircle size={12} />
                            <span>{task.priority}</span>
                          </div>
                          
                          <DropdownMenu.Root>
                            <DropdownMenu.Trigger asChild>
                              <button style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4 }}>
                                <MoreHorizontal size={16} />
                              </button>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Portal>
                              <DropdownMenu.Content className="dropdown-content glass-panel" style={{ minWidth: 150, zIndex: 100, padding: 8 }}>
                                {prevState && (
                                  <DropdownMenu.Item className="dropdown-item" onSelect={() => updateTaskState(task.id, prevState)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", cursor: "pointer", borderRadius: 8, color: "var(--text-secondary)", fontSize: 13, fontWeight: 600 }}>
                                    <ArrowLeft size={14} /> Move Left
                                  </DropdownMenu.Item>
                                )}
                                {nextState && (
                                  <DropdownMenu.Item className="dropdown-item" onSelect={() => updateTaskState(task.id, nextState)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", cursor: "pointer", borderRadius: 8, color: "var(--text-secondary)", fontSize: 13, fontWeight: 600 }}>
                                    Move Right <ArrowRight size={14} />
                                  </DropdownMenu.Item>
                                )}
                              </DropdownMenu.Content>
                            </DropdownMenu.Portal>
                          </DropdownMenu.Root>
                        </div>
                        
                        <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-primary)", lineHeight: 1.3, marginBottom: 8 }}>
                          {task.title}
                        </h3>
                        
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "12px", fontWeight: "600" }}>
                            <Clock size={12} />
                            <span>{new Date(task.targetDeadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                          </div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--brand)" }}>
                            {task.potentialPoints} XP
                          </div>
                        </div>

                        {/* Progress bar */}
                        {task.progressPercentage > 0 && task.progressPercentage < 100 && (
                          <div style={{ marginTop: "16px", height: "4px", backgroundColor: "var(--bg-muted)", borderRadius: "2px", overflow: "hidden" }}>
                            <div style={{ 
                              height: "100%", width: `${task.progressPercentage}%`, 
                              background: "linear-gradient(90deg, var(--brand), #4338CA)",
                              borderRadius: "2px"
                            }} />
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                
                {columnTasks.length === 0 && (
                  <div style={{ textAlign: "center", padding: "30px 10px", color: "var(--text-muted)", fontSize: 13, fontWeight: 500, border: "1px dashed var(--border-strong)", borderRadius: 16, opacity: 0.6 }}>
                    No tasks here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
