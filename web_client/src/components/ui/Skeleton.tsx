"use client";

import React from "react";
import { motion } from "framer-motion";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ width = "100%", height = "100%", borderRadius = 8, className = "", style }: SkeletonProps) {
  return (
    <motion.div
      className={`skeleton-loader ${className}`}
      style={{
        width,
        height,
        borderRadius,
        background: "linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%)",
        backgroundSize: "200% 100%",
        ...style,
      }}
      animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
    />
  );
}
