import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Dumbbell, User, Shield } from "lucide-react";
import { useLocation } from "wouter";
import heroImage from "@assets/generated_images/Gym_hero_background_image_43c161d8.png";

export default function Landing() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen">
      <header className="absolute top-0 left-0 right-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-8 w-8 text-white" />
            <span className="text-2xl font-display font-bold tracking-tight text-white">
              FitPro
            </span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <section className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Gym hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" />
        </div>

        <div className="relative z-10 container mx-auto px-6 text-center py-32">
          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight text-white mb-6">
            FitPro Management System
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-16 max-w-3xl mx-auto">
            Complete online gym management platform with client dashboards, admin controls,
            workout libraries, diet management, and live training sessions
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 max-w-2xl mx-auto">
            <Button
              size="lg"
              className="text-lg px-12 py-6 h-auto w-full sm:w-auto backdrop-blur-sm bg-primary/90 hover:bg-primary"
              onClick={() => setLocation("/client")}
              data-testid="button-client-access"
            >
              <User className="h-5 w-5 mr-2" />
              Client Dashboard
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-12 py-6 h-auto w-full sm:w-auto backdrop-blur-sm bg-background/10 hover:bg-background/20 border-white/30 text-white hover:text-white"
              onClick={() => setLocation("/admin")}
              data-testid="button-admin-access"
            >
              <Shield className="h-5 w-5 mr-2" />
              Admin Dashboard
            </Button>
          </div>

          <p className="text-white/70 text-sm mt-8">
            Demo Mode: Explore both client and admin interfaces with sample data
          </p>
        </div>
      </section>
    </div>
  );
}
