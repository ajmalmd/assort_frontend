import { useNavigate } from "react-router";
import { getAccessToken } from "@/api/authStore";
import Hero from "@/assets/images/Hero.png";

const HeroSection = () => {
  const navigate = useNavigate();
  const token = getAccessToken();
  return (
    <section className="min-h-screen bg-gradient-to-br from-accent/60 via-background to-white pt-32 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Text content */}
          <div className="flex flex-col justify-center space-y-6">
            <h1 className="text-5xl sm:text-6xl font-bold text-foreground leading-tight">
              Clear projects. Connected teams.
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
              Bring structure to your work hierarchy and context to your team's
              communication – all in one powerful, scalable platform.
            </p>

            <div>
              <button
                className="bg-primary hover:bg-primary/90 text-white rounded-xl px-8 py-4 text-base font-medium transition"
                onClick={() =>
                  navigate(token ? "/app" : "/create-organization")
                }
              >
                {token ? "Go to App" : "Create your workspace"}
              </button>
            </div>
          </div>

          {/* Right side - Dashboard mockup */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-md">
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-border">
                <img
                  src={Hero}
                  alt="Assort Dashboard"
                  className="w-full h-auto object-fill"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
