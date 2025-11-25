"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface GradientLightingProps {
  accentColor?: string;
  intensity?: number;
}

// Predefined color schemes for different event types/trends
export const colorSchemes = {
  music: {
    primary: "#FF006E",
    secondary: "#8338EC",
    tertiary: "#3A86FF",
  },
  sports: {
    primary: "#06FFA5",
    secondary: "#FFFB00",
    tertiary: "#FF006E",
  },
  arts: {
    primary: "#A76BFF",
    secondary: "#FF6B9D",
    tertiary: "#FFB86B",
  },
  tech: {
    primary: "#00F5FF",
    secondary: "#7B2BFF",
    tertiary: "#FF2B6C",
  },
  default: {
    primary: "#FF5C7A",
    secondary: "#8A5CFF",
    tertiary: "#00FFD1",
  },
};

export function GradientLighting({ accentColor = "default", intensity = 0.3 }: GradientLightingProps) {
  const [scheme, setScheme] = useState(colorSchemes.default);

  useEffect(() => {
    // Update color scheme based on accent color prop
    if (accentColor in colorSchemes) {
      setScheme(colorSchemes[accentColor as keyof typeof colorSchemes]);
    }
  }, [accentColor]);

  return (
    <>
      {/* Ambient Gradient Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Top Left Orb */}
        <motion.div
          className="absolute -top-[20%] -left-[10%] w-[60%] aspect-square rounded-full blur-[120px]"
          style={{
            background: `radial-gradient(circle, ${scheme.primary}${Math.floor(intensity * 255).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
          }}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Top Right Orb */}
        <motion.div
          className="absolute -top-[20%] -right-[10%] w-[50%] aspect-square rounded-full blur-[120px]"
          style={{
            background: `radial-gradient(circle, ${scheme.secondary}${Math.floor(intensity * 255).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
          }}
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Bottom Center Orb */}
        <motion.div
          className="absolute -bottom-[20%] left-[30%] w-[50%] aspect-square rounded-full blur-[120px]"
          style={{
            background: `radial-gradient(circle, ${scheme.tertiary}${Math.floor(intensity * 255).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
          }}
          animate={{
            scale: [1, 1.1, 1],
            x: [0, 40, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Light Sweeps */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${scheme.primary}15 50%, transparent 100%)`,
          }}
          animate={{
            x: ["-100%", "100%"],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        
        <motion.div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(45deg, transparent 0%, ${scheme.secondary}10 50%, transparent 100%)`,
          }}
          animate={{
            x: ["100%", "-100%"],
            y: ["-50%", "50%"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>
    </>
  );
}
