"use client";

import { useEffect } from "react";

import { useIntro } from "@/components/intro-provider";
import { GsapIntro } from "@/components/ui/gsap-intro";
import { AnimatePresence, motion } from "framer-motion";

export function GlobalPreloader() {
  const { introComplete, setIntroComplete } = useIntro();

  // Safety timeout to ensure app is accessible even if GSAP hangs
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!introComplete) {
        console.warn("GlobalPreloader: Safety timeout triggered");
        setIntroComplete(true);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [introComplete, setIntroComplete]);

  return (
    <AnimatePresence mode="wait">
      {!introComplete && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-xl flex items-center justify-center"
        >
          <GsapIntro onComplete={() => setIntroComplete(true)} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
