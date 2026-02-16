import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import DotsBg from "@/assets/images/DotsBg.png"

const AuthLayout = ({ children }) => {
  return (
    <div
      className="min-h-screen flex bg-repeat"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url(${DotsBg})`,
      }}
    >
      {/* Back Button */}
      <Link
        to="/"
        className="fixed top-6 left-6 z-50 bg-gray-900 text-white rounded-full p-2 hover:bg-gray-800 transition-colors"
      >
        <ArrowLeft size={20} />
      </Link>

      {/* Left Side - Branding */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center items-start px-16 py-12">
        <h1 className="text-4xl font-normal mb-2">Assort</h1>

        <p className="text-gray-600 text-sm mb-12">
          Workplace Resource Interface
        </p>

        <h2 className="text-5xl font-semibold leading-tight mb-6 text-gray-900">
          Unify Your Projects. Empower Your Team.
        </h2>

        <p className="text-gray-600 text-base leading-relaxed max-w-lg">
          Bring structure to your work hierarchy and context to your team’s
          communication — all in one powerful, scalable platform.
        </p>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
