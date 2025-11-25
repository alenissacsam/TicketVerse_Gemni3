"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { ReactNode, useRef } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover3D?: boolean;
  parallaxStrength?: number;
  glowOnHover?: boolean;
  onClick?: () => void;
}

export const GlassCard = ({
  children,
  className,
  hover3D = true,
  parallaxStrength = 15,
  glowOnHover = true,
  onClick,
}: GlassCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Transform mouse position to rotation values for 3D effect
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [parallaxStrength, -parallaxStrength]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-parallaxStrength, parallaxStrength]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hover3D || !cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseXRelative = (e.clientX - centerX) / rect.width;
    const mouseYRelative = (e.clientY - centerY) / rect.height;
    
    mouseX.set(mouseXRelative);
    mouseY.set(mouseYRelative);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        "glass-card relative overflow-hidden rounded-xl backdrop-blur-xl",
        "bg-gradient-to-br from-white/10 to-white/5",
        "border border-white/20",
        "shadow-lg shadow-black/10",
        "transition-all duration-300",
        glowOnHover && "hover:shadow-2xl hover:shadow-primary/20 hover:border-white/30",
        onClick && "cursor-pointer",
        className
      )}
      style={{
        rotateX: hover3D ? rotateX : 0,
        rotateY: hover3D ? rotateY : 0,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Gradient glow overlay on hover */}
      {glowOnHover && (
        <motion.div
          className="absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none"
          style={{
            background: "radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.1) 0%, transparent 50%)",
          }}
          whileHover={{ opacity: 1 }}
        />
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Subtle border shimmer */}
      <div className="absolute inset-0 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      </div>
    </motion.div>
  );
};
