import { Check } from "lucide-react";

const features = [
  {
    title: "Structured Work Hierarchy",
    items: [
      "Projects organize your work",
      "Subtasks break down complexity",
      "Progress tracking at every level",
      "Clear ownership and accountability",
    ],
  },
  {
    title: "Context-Aware Communication",
    items: [
      "Chat tied to specific projects",
      "Files stored with context",
      "Issues linked to work items",
      "Reduce information silos",
    ],
  },
  {
    title: "Real-Time Collaboration",
    items: [
      "Live updates across teams",
      "Instant notifications",
      "Video calls with screen sharing",
      "Seamless integrations",
    ],
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900">
            Powerful Features for Modern Teams
          </h2>
          <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
            Everything you need to structure work, collaborate effectively, and
            move faster — all in one unified platform.
          </p>
        </div>

        {/* Feature Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {features.map((feature, index) => (
            <div key={index} className="space-y-6">
              <h3 className="text-2xl font-semibold text-gray-900">
                {feature.title}
              </h3>

              <ul className="space-y-4">
                {feature.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start gap-4">
                    <div className="shrink-0 mt-1">
                      <div className="flex items-center justify-center h-6 w-6 rounded-full border border-gray-300 bg-gray-50">
                        <Check className="h-4 w-4 text-gray-700" />
                      </div>
                    </div>
                    <span className="text-gray-600 text-base">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
