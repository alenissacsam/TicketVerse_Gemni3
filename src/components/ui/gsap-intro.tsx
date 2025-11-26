"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

interface GsapIntroProps {
  onComplete: () => void;
}

export function GsapIntro({ onComplete }: GsapIntroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<HTMLSpanElement[]>([]);

  const line1 = "Experience the next".split(" ");
  const line2 = "generation of ticketing.".split(" ");

  const addToRefs = (el: HTMLSpanElement) => {
    if (el && !wordRefs.current.includes(el)) {
      wordRefs.current.push(el);
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          setTimeout(onComplete, 100);
        }
      });

      // Initial state
      gsap.set(wordRefs.current, {
        y: 100,
        opacity: 0,
        filter: "blur(15px)",
        rotateX: 45
      });

      // Animate Words
      tl.to(wordRefs.current, {
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        rotateX: 0,
        duration: 1.6, // Slower, more elegant
        stagger: 0.08, // More separation between words
        ease: "expo.out", // Premium "snap and glide" feel
      })
        // Hold
        .to({}, { duration: 1.2 })
        // Exit
        .to(wordRefs.current, {
          y: -50,
          opacity: 0,
          filter: "blur(10px)",
          duration: 0.8,
          stagger: 0.01, // Fast ripple exit
          ease: "power3.inOut"
        });

    }, containerRef);

    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div ref={containerRef} className="flex flex-col items-center justify-center z-50 perspective-1000">
      <div className="overflow-hidden mb-2 p-4 -m-4">
        {line1.map((word, i) => (
          <span
            key={i}
            ref={addToRefs}
            className="opacity-0 inline-block text-2xl md:text-4xl font-serif italic font-medium text-white tracking-tight mx-2"
            style={{ textShadow: "0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.5), 0 0 30px rgba(255,255,255,0.3)" }}
          >
            {word}
          </span>
        ))}
      </div>
      <div className="overflow-hidden p-4 -m-4">
        {line2.map((word, i) => (
          <span
            key={i}
            ref={addToRefs}
            className="opacity-0 inline-block text-2xl md:text-4xl font-serif italic font-medium text-white tracking-tight mx-2"
            style={{ textShadow: "0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.5), 0 0 30px rgba(255,255,255,0.3)" }}
          >
            {word}
          </span>
        ))}
      </div>
    </div>
  );
}
