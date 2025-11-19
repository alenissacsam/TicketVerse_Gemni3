"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Wallet, Ticket, QrCode, Zap, ShieldCheck, Globe } from "lucide-react";

const steps = [
  {
    icon: Wallet,
    title: "Connect & Authenticate",
    subtitle: "Zero-Knowledge Onboarding",
    description: "Seamlessly connect your Web3 wallet or sign in with social accounts. Our smart contract factory automatically deploys a unique identity proxy for every user.",
    details: ["ERC-4337 Account Abstraction", "Social Login Integration", "Non-Custodial Security"]
  },
  {
    icon: Ticket,
    title: "Mint & Configure",
    subtitle: "Dynamic NFT Standards",
    description: "Define event parameters on-chain. Set supply caps, royalty splits, and dynamic pricing models. Tickets are minted as verifiable NFTs with embedded utility.",
    details: ["Gas-Free Minting", "Metadata Encryption", "Royalty Enforcement"]
  },
  {
    icon: Globe,
    title: "Distribute & Sell",
    subtitle: "Global Liquidity Layer",
    description: "List your event on the decentralized marketplace. Leverage our global liquidity layer for instant settlements and secondary market trading with enforced royalties.",
    details: ["Instant Settlement", "Cross-Chain Compatibility", "Automated Market Making"]
  },
  {
    icon: QrCode,
    title: "Verify & Access",
    subtitle: "Cryptographic Proof of Attendance",
    description: "Attendees prove ownership via cryptographic signatures. QR codes generate dynamic, time-based tokens that prevent screenshotting and replay attacks.",
    details: ["Offline Verification", "Anti-Spoofing Logic", "POAP Integration"]
  }
];

export function FeatureTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  return (
    <div ref={containerRef} className="relative py-32 px-6 max-w-5xl mx-auto">
      <div className="text-center mb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-block px-3 py-1 mb-4 text-xs font-mono text-purple-600 bg-purple-50 rounded-full uppercase tracking-widest"
        >
          Protocol Workflow
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-serif text-slate-900 mb-6"
        >
          How TicketVerse Works
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-slate-500 text-lg max-w-2xl mx-auto font-light"
        >
          A decentralized infrastructure layer for the next generation of live events.
        </motion.p>
      </div>

      <div className="relative">
        {/* Connecting Line */}
        <div className="absolute left-[28px] md:left-1/2 top-0 bottom-0 w-px bg-slate-200 -translate-x-1/2" />
        <motion.div 
          style={{ scaleY: scrollYProgress, transformOrigin: "top" }}
          className="absolute left-[28px] md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-purple-500 via-blue-500 to-purple-500 -translate-x-1/2"
        />

        <div className="space-y-24">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
              className={`relative flex flex-col md:flex-row gap-8 md:gap-16 items-center ${
                index % 2 === 0 ? "md:flex-row-reverse" : ""
              }`}
            >
              {/* Icon Bubble */}
              <div className="absolute left-[28px] md:left-1/2 -translate-x-1/2 flex items-center justify-center w-14 h-14 rounded-full bg-white border-4 border-slate-50 shadow-lg z-10">
                <step.icon className="w-6 h-6 text-slate-700" />
              </div>

              {/* Content Card */}
              <div className="w-full md:w-[calc(50%-32px)] pl-20 md:pl-0">
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="text-xs font-mono text-slate-400 mb-2 uppercase tracking-wider">{step.subtitle}</div>
                  <h3 className="text-2xl font-serif text-slate-900 mb-4">{step.title}</h3>
                  <p className="text-slate-600 leading-relaxed mb-6 font-light">
                    {step.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {step.details.map((detail, i) => (
                      <span key={i} className="px-2 py-1 bg-slate-50 text-slate-500 text-[10px] font-mono uppercase tracking-wide rounded-md border border-slate-100">
                        {detail}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Empty Space for Timeline Balance */}
              <div className="hidden md:block w-[calc(50%-32px)]" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
