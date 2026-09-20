import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Back Button */}
      <Link
        to="/"
        aria-label="Back to Assort home"
        className="fixed top-6 left-6 z-50 bg-primary text-white rounded-full p-2 hover:bg-primary/90 transition-colors"
      >
        <ArrowLeft size={20} />
      </Link>

      {/* Left Side - Branding */}
      <div className="hidden lg:flex bg-accent/50 w-1/2 flex-col justify-center items-start px-16 py-12">
        <h1 className="text-4xl font-normal mb-2">Assort</h1>

        <p className="text-muted-foreground text-sm mb-12">
          Projects, people, and progress. Together.
        </p>

        <h2 className="text-5xl font-semibold leading-tight mb-6 text-foreground">
          Unify Your Projects. Empower Your Team.
        </h2>

        <p className="text-muted-foreground text-base leading-relaxed max-w-lg">
          Bring structure to your work hierarchy and context to your team’s
          communication — all in one powerful, scalable platform.
        </p>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 pt-24 pb-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8 border border-border">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
