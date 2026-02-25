import { useState } from "react";
import { X, GripVertical, Plus, Trash2 } from "lucide-react";
import Select from "react-select";

export function CreatePlanModal({ isOpen, onClose, onCreatePlan }) {
  const [planName, setPlanName] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("YEARLY");
  const [features, setFeatures] = useState([{ id: "1", name: "" }]);
  const [maxProjects, setMaxProjects] = useState("");
  const [maxMembers, setMaxMembers] = useState("");
  const [storage, setStorage] = useState("");
  const [draggedId, setDraggedId] = useState(null);

  const handleAddFeature = () => {
    const newId = String(
      Math.max(...features.map((f) => parseInt(f.id)), 0) + 1,
    );
    setFeatures([...features, { id: newId, name: "" }]);
  };

  const durationOptions = [
    { value: "MONTHLY", label: "Monthly" },
    { value: "YEARLY", label: "Yearly" },
  ];

  const handleRemoveFeature = (id) => {
    if (features.length > 1) {
      setFeatures(features.filter((f) => f.id !== id));
    }
  };

  const handleUpdateFeature = (id, name) => {
    setFeatures(features.map((f) => (f.id === id ? { ...f, name } : f)));
  };

  const handleDragStart = (id) => {
    setDraggedId(id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (targetId) => {
    if (!draggedId || draggedId === targetId) return;

    const draggedIndex = features.findIndex((f) => f.id === draggedId);
    const targetIndex = features.findIndex((f) => f.id === targetId);

    const newFeatures = [...features];
    const [draggedFeature] = newFeatures.splice(draggedIndex, 1);
    newFeatures.splice(targetIndex, 0, draggedFeature);

    setFeatures(newFeatures);
    setDraggedId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onCreatePlan({
      name: planName,
      price: parseFloat(price),
      billing_cycle: duration,
      max_projects: maxProjects ? parseInt(maxProjects) : null,
      max_members: maxMembers ? parseInt(maxMembers) : null,
      storage_limit_gb: storage ? parseInt(storage) : null,
      features_json: features.map((f) => f.name.trim()),
    });

    resetForm();
  };

  const resetForm = () => {
    setPlanName("");
    setPrice("");
    setDuration("Yearly");
    setFeatures([{ id: "1", name: "" }]);
    setMaxProjects("");
    setMaxMembers("");
    setStorage("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">
            Create New Subscription Plan
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-700" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Plan Name */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Plan Name
            </label>
            <input
              type="text"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              placeholder="e.g., Pro Plan"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              required
            />
          </div>

          {/* Price and Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Price (₹)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="29.99"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Duration
              </label>
              <Select
                options={durationOptions}
                value={durationOptions.find((opt) => opt.value === duration)}
                onChange={(selectedOption) => setDuration(selectedOption.value)}
                isSearchable={false}
                className="w-full"
                styles={{
                  control: (base, state) => ({
                    ...base,
                    borderRadius: "0.5rem",
                    padding: "2px",
                    borderColor: state.isFocused ? "black" : "#D1D5DB",
                    boxShadow: state.isFocused ? "0 0 0 2px black" : "none",
                    "&:hover": {
                      borderColor: "black",
                    },
                  }),
                  menu: (base) => ({
                    ...base,
                    borderRadius: "0.5rem",
                    overflow: "hidden",
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isSelected
                      ? "black"
                      : state.isFocused
                        ? "black"
                        : "white",
                    color:
                      state.isSelected || state.isFocused ? "white" : "black",
                    cursor: "pointer",
                  }),
                  singleValue: (base) => ({
                    ...base,
                    color: "black",
                  }),
                }}
              />
            </div>
          </div>

          {/* Features */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-900">
                Features
              </label>
              <button
                type="button"
                onClick={handleAddFeature}
                className="flex items-center gap-1 px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Plus size={16} />
                Add Feature
              </button>
            </div>
            <div className="space-y-2 bg-gray-50 p-3 rounded-lg">
              {features.map((feature) => (
                <div
                  key={feature.id}
                  draggable
                  onDragStart={() => handleDragStart(feature.id)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(feature.id)}
                  className={`flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-lg transition-all ${
                    draggedId === feature.id ? "opacity-50" : ""
                  }`}
                >
                  <GripVertical
                    size={16}
                    className="text-gray-400 cursor-grab"
                  />
                  <input
                    type="text"
                    value={feature.name}
                    onChange={(e) =>
                      handleUpdateFeature(feature.id, e.target.value)
                    }
                    placeholder="e.g., Unlimited projects"
                    className="flex-1 px-3 py-1 border-0 bg-transparent focus:outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(feature.id)}
                    className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                    disabled={features.length === 1}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Plan Limits */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Plan Limits
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Max Projects
                </label>
                <input
                  type="number"
                  value={maxProjects}
                  onChange={(e) => setMaxProjects(e.target.value)}
                  placeholder="Leave empty for unlimited"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Max Members
                </label>
                <input
                  type="number"
                  value={maxMembers}
                  onChange={(e) => setMaxMembers(e.target.value)}
                  placeholder="Leave empty for unlimited"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Storage (GB)
                </label>
                <input
                  type="number"
                  value={storage}
                  onChange={(e) => setStorage(e.target.value)}
                  placeholder="5000"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gray-900 text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              Create Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
