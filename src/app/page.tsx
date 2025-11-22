import { LandingHero } from "@/components/landing-hero";
import { EventSlider } from "@/components/event-slider";
import { ProtocolWorkflowV2 } from "@/components/protocol-flow";
import { VelocityScroll } from "@/components/velocity-scroll";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-black">
      <LandingHero />
      <VelocityScroll />
      <EventSlider />
      <ProtocolWorkflowV2 />
    </main>
  );
}
