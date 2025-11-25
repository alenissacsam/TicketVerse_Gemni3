import { LandingHero } from "@/components/landing-hero";
import { EventSlider } from "@/components/event-slider";

import { VelocityScroll } from "@/components/velocity-scroll";
import { GradientLighting } from "@/components/ui/GradientLighting";
import { ProtocolTransparency } from "@/components/protocol-transparency";

export default function LandingPage() {
  return (
    <main className="min-h-screen relative">
      {/* Gradient Lighting Ambient Effects */}
      <GradientLighting accentColor="default" intensity={0.25} />
      
      <LandingHero />
      <VelocityScroll />
      <EventSlider />
      
      {/* Protocol Transparency Toggle */}
      <section className="bg-black relative z-10">
        <ProtocolTransparency />
      </section>
      

    </main>
  );
}
