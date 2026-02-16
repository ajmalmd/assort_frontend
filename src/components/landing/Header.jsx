import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const Header = () => {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-3xl font-medium text-gray-900">
          Assort
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="text-gray-700 hover:text-gray-900 text-sm font-medium transition"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="text-gray-700 hover:text-gray-900 text-sm font-medium transition"
          >
            Pricing
          </a>

          <Link to="/login">
            <Button
              className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6"
              size="sm"
            >
              SIGN IN
            </Button>
          </Link>
        </div>

        {/* Mobile Button */}
        <button
          className="md:hidden text-gray-900"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-200 px-6 py-4 space-y-4">
          <a href="#features" className="block text-gray-700">
            Features
          </a>
          <a href="#pricing" className="block text-gray-700">
            Pricing
          </a>
          <a href="#resources" className="block text-gray-700">
            Resources
          </a>

          <Link to="/login">
            <Button className="w-full bg-gray-900 text-white rounded-full">
              SIGN IN
            </Button>
          </Link>
        </div>
      )}
    </header>
  );
};

export default Header;
