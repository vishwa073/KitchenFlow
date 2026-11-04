import LandingHeader from "./components/LandingHeader";
import HeroSection from "./components/HeroSection";
import HowItWorks from "./components/HowItWorks";
import LandingFooter from "./components/LandingFooter";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900">
      <LandingHeader />
      <main>
        <HeroSection />
        <HowItWorks />
      </main>
      <LandingFooter />
    </div>
  );
}


