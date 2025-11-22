"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Wallet, Ticket, QrCode, ShieldCheck, Globe } from "lucide-react";

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
    <div ref={containerRef} className="relative py-32 px-6 max-w-full mx-auto bg-slate-50/50 overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.4]"
        style={{
          backgroundImage: `radial-gradient(#cbd5e1 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 mb-6 text-xs font-medium text-slate-800 bg-slate-100/80 backdrop-blur-sm rounded-full uppercase tracking-widest border border-slate-200 shadow-sm"
          >
            Protocol Workflow
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-serif text-slate-900 mb-8 tracking-tighter"
          >
            How Ticket<span className="italic text-slate-600">Verse</span> Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 text-xl md:text-2xl max-w-3xl mx-auto font-light leading-relaxed"
          >
            A decentralized infrastructure layer for the next generation of live events.
          </motion.p>
        </div>

        <div className="relative">
          {/* Connecting Line */}
          <div className="absolute left-[28px] md:left-1/2 top-0 bottom-0 w-px bg-slate-200 -translate-x-1/2" />
          <motion.div
            style={{ scaleY: scrollYProgress, transformOrigin: "top" }}
            className="absolute left-[28px] md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-slate-300 via-slate-400 to-slate-300 -translate-x-1/2"
          />

          <div className="space-y-32">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7 }}
                className={`relative flex flex-col md:flex-row gap-12 md:gap-24 items-center ${index % 2 === 0 ? "md:flex-row-reverse" : ""
                  }`}
              >
                {/* Icon Bubble */}
                <div className="absolute left-[28px] md:left-1/2 -translate-x-1/2 flex items-center justify-center w-20 h-20 rounded-full bg-white border border-slate-200 shadow-2xl shadow-slate-300/50 z-10">
                  <step.icon className="w-8 h-8 text-slate-800" strokeWidth={1} />
                </div>

                {/* Content Card */}
                <div className="w-full md:w-[calc(50%-48px)] pl-20 md:pl-0">
                  <div className="group relative bg-white p-12 rounded-[2.5rem] border border-slate-100 hover:border-slate-300 transition-all duration-500 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] hover:-translate-y-2">
                    <div className="text-xs font-bold text-slate-700 mb-6 uppercase tracking-widest">{step.subtitle}</div>
                    <h3 className="text-4xl font-serif text-slate-900 mb-6 tracking-tight">{step.title}</h3>
                    <p className="text-slate-600 leading-relaxed mb-10 font-light text-lg">
                      {step.description}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {step.details.map((detail, i) => (
                        <span key={i} className="px-4 py-2 bg-slate-50 text-slate-600 text-xs font-medium uppercase tracking-wide rounded-xl border border-slate-100 group-hover:bg-slate-100 group-hover:text-slate-800 group-hover:border-slate-200 transition-all">
                          {detail}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Empty Space for Timeline Balance */}
                <div className="hidden md:block w-[calc(50%-48px)]" />
              </motion.div>
            ))}
          </div>
        </div >
      </div >
    </div >
  );
}
