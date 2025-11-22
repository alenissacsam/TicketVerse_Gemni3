"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BackgroundPaths } from "@/components/ui/background-paths";

export const LandingHero = () => {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-black text-white">
      {/* Background Paths */}
      <div className="absolute inset-0 z-0">
        <BackgroundPaths title="" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-5xl mx-auto space-y-8">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-xl mb-4 animate-fade-in-up">
          <div className="w-2 h-2 rounded-full bg-white/80 animate-pulse" />
          <span className="text-sm font-medium text-white/90 tracking-wide">
            The Future of Live Events
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="text-7xl md:text-9xl font-display tracking-tight animate-fade-in-up delay-100 drop-shadow-2xl">
          <span className="block text-white">Ticket</span>
          <span className="block text-white/90">Verse</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200">
          Experience the next generation of ticketing. <br />
          <span className="text-white font-medium">Secure. Transparent. Unforgettable.</span>
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-8 animate-fade-in-up delay-300">
          <Link href="/events">
            <Button 
              size="lg" 
              className="rounded-full px-8 py-6 text-lg bg-white text-black hover:bg-white/90 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.6)] hover:scale-105"
            >
              Explore Events
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          
          <Link href="/about">
            <Button 
              variant="ghost" 
              size="lg"
              className="rounded-full px-8 py-6 text-lg text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300"
            >
              Learn more
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
