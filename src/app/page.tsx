"use client";

import { motion } from "framer-motion";
import { LandingHero } from "@/components/landing-hero";
import { EventSlider } from "@/components/event-slider";
import { VelocityScroll } from "@/components/velocity-scroll";
import { GradientLighting } from "@/components/ui/GradientLighting";
import { ProtocolFlow } from "@/components/protocol-flow";
import { LivePulse } from "@/components/live-pulse";

export default function LandingPage() {
  return (
    <main className="min-h-screen relative">
      {/* Gradient Lighting Ambient Effects */}
      {/* Gradient Lighting Ambient Effects - Removed per user request */}
      
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 1 }}
      >
        <LandingHero />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.8 }}
      >
        <VelocityScroll />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        <EventSlider />
      </motion.div>
      
      <ProtocolFlow />
      <LivePulse />
    </main>
  );
}
