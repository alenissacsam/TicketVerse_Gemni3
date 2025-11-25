"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";

interface DistortionTextProps {
  text: string;
  className?: string;
  trigger?: boolean;
  onComplete?: () => void;
}

export function DistortionText({ text, className, trigger = false, onComplete }: DistortionTextProps) {
  const controls = useAnimation();

  useEffect(() => {
    if (trigger) {
      animate();
    }
  }, [trigger]);

  const animate = async () => {
    await controls.start({
      opacity: 1,
      scale: [1, 1.1, 1],
      filter: [
        "blur(10px) brightness(0)",
        "blur(0px) brightness(1)",
        "blur(5px) brightness(1.5)",
        "blur(0px) brightness(1)",
      ],
      x: [0, -5, 5, -2, 2, 0],
      transition: { duration: 0.8, ease: "circOut" },
    });
    if (onComplete) onComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(10px)" }}
      animate={controls}
      className={className}
    >
      {text}
    </motion.div>
  );
}
