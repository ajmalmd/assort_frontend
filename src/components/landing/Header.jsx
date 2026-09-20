import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { getAccessToken } from "@/api/authStore";

const Header = () => {
  const [open, setOpen] = useState(false);

  const token = getAccessToken();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-border">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-3xl font-medium text-foreground">
          Assort
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="text-gray-700 hover:text-foreground text-sm font-medium transition"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="text-gray-700 hover:text-foreground text-sm font-medium transition"
          >
            Pricing
          </a>

          {!token && (
            <Link to="/login">
              <Button
                className="bg-primary hover:bg-primary/90 text-white rounded-full px-6"
                size="sm"
              >
                SIGN IN
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Button */}
        <button
          className="md:hidden text-foreground"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-border px-6 py-4 space-y-4">
          <a href="#features" className="block text-gray-700">
            Features
          </a>
          <a href="#pricing" className="block text-gray-700">
            Pricing
          </a>

          {!token && (
            <Link to="/login">
              <Button className="w-full bg-primary text-white rounded-full">
                SIGN IN
              </Button>
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
