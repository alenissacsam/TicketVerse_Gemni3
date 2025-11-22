"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const phrases = [
  "Experience the next generation of ticketing",
  "TicketVerse"
];

export function RevealPreloader() {
  const [index, setIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => {
        if (prev === phrases.length - 1) {
          clearInterval(interval);
          setTimeout(() => setIsVisible(false), 1000);
          return prev;
        }
        return prev + 1;
      });
    }, 1800); // Slightly adjusted duration for better readability

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-white px-4"
        >
          <div className="relative overflow-hidden h-32 w-full max-w-4xl flex items-center justify-center">
            <AnimatePresence mode="popLayout">
              <motion.h1
                key={phrases[index]}
                initial={{ y: "110%", opacity: 0, filter: "blur(8px)" }}
                animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                exit={{ y: "-110%", opacity: 0, filter: "blur(8px)" }}
                transition={{
                  y: { duration: 0.8, ease: [0.32, 0.72, 0, 1] }, // Fluid "Apple-like" ease
                  opacity: { duration: 0.5 },
                  filter: { duration: 0.5 }
                }}
                className={`text-center font-serif font-medium text-black leading-tight absolute w-full
                  ${index === 0 ? "text-2xl md:text-4xl max-w-xl" : "text-5xl md:text-8xl tracking-tighter"}
                `}
              >
                {phrases[index]}
              </motion.h1>
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
