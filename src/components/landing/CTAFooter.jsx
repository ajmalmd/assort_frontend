import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTAFooter = () => {
  const navigate = useNavigate();
  const year = new Date().getFullYear();
  return (
    <>
      {/* CTA Section */}
      <section className="bg-gray-900 text-white py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-4xl sm:text-5xl font-bold leading-tight">
            Ready to Unify Your Team?
          </h2>

          <p className="text-lg text-gray-300">
            Start free with unlimited communication. Upgrade anytime as your
            organization grows.
          </p>

          <Link to="/create-organization">
            <Button
              className="bg-white hover:bg-gray-100 text-gray-900 rounded-full px-8 py-6 text-base font-semibold inline-flex items-center gap-2 transition"
              onClick={() => navigate("/create-organization")}
            >
              Get Started - Manage Projects
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <h3 className="font-bold text-gray-900 mb-4 text-lg">Assort</h3>
              <p className="text-sm text-gray-600">
                Unify projects. Empower teams.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4 text-sm">
                Product
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#features"
                    className="text-sm text-gray-600 hover:text-gray-900 transition"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="text-sm text-gray-600 hover:text-gray-900 transition"
                  >
                    Pricing
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4 text-sm">
                Company
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/about"
                    className="text-sm text-gray-600 hover:text-gray-900 transition"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="text-sm text-gray-600 hover:text-gray-900 transition"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4 text-sm">
                Legal
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/privacy"
                    className="text-sm text-gray-600 hover:text-gray-900 transition"
                  >
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms"
                    className="text-sm text-gray-600 hover:text-gray-900 transition"
                  >
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-sm text-gray-600">
              © {year} Assort. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default CTAFooter;
