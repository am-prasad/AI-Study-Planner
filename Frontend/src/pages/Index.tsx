import { HeroSection } from "@/components/HeroSection";
import { ModeToggle } from "@/components/ModeToggle";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <div className="pb-20">
        <ModeToggle />
      </div>
    </div>
  );
};

export default Index;
