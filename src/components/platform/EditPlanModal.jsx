import { useEffect, useState } from "react";
import { X, GripVertical, Plus, Trash2 } from "lucide-react";
import Select from "react-select";

export function EditPlanModal({ isOpen, onClose, plan, onUpdatePlan }) {
  const [planName, setPlanName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("YEARLY");
  const [features, setFeatures] = useState([{ id: "1", name: "" }]);
  const [maxProjects, setMaxProjects] = useState("");
  const [maxMembers, setMaxMembers] = useState("");
  const [storage, setStorage] = useState("");
  const [draggedId, setDraggedId] = useState(null);

  // If plan has active subscribers, lock price and billing cycle
  const lockedFields = plan?.subscription_count > 0;

  const durationOptions = [
    { value: "MONTHLY", label: "Monthly" },
    { value: "YEARLY", label: "Yearly" },
  ];

  useEffect(() => {
    if (plan) {
      setPlanName(plan.name);
      setDescription(plan.description || "");
      setPrice(plan.price);
      setDuration(plan.billing_cycle || "YEARLY");
      setMaxProjects(plan.max_projects || "");
      setMaxMembers(plan.max_members || "");
      setStorage(plan.storage_limit_gb || "");
      setFeatures(
        (plan.features_json || []).map((f, i) => ({
          id: String(i + 1),
          name: f,
        })),
      );
    }
  }, [plan]);

  const handleAddFeature = () => {
    const newId = String(
      Math.max(...features.map((f) => parseInt(f.id)), 0) + 1,
    );
    setFeatures([...features, { id: newId, name: "" }]);
  };

  const handleRemoveFeature = (id) => {
    if (features.length > 1) setFeatures(features.filter((f) => f.id !== id));
  };

  const handleUpdateFeature = (id, name) => {
    setFeatures(features.map((f) => (f.id === id ? { ...f, name } : f)));
  };

  const handleDragStart = (id) => setDraggedId(id);
  const handleDragOver = (e) => e.preventDefault();
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
    onUpdatePlan(plan.id, {
      name: planName,
      description,
      price: parseFloat(price),
      billing_cycle: duration,
      max_projects: maxProjects ? parseInt(maxProjects) : null,
      max_members: maxMembers ? parseInt(maxMembers) : null,
      storage_limit_gb: storage ? parseInt(storage) : null,
      features_json: features.map((f) => f.name.trim()),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">
            Edit Subscription Plan
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} className="text-gray-700" />
          </button>
        </div>

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
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          {/* Price & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Price (₹)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                step="0.01"
                className="w-full px-4 py-2 border rounded-lg"
                disabled={lockedFields}
              />
              {lockedFields && (
                <p className="text-xs text-gray-500 mt-1">
                  Price cannot be edited for active plans.
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium">Billing Cycle</label>
              <Select
                options={durationOptions}
                value={durationOptions.find((o) => o.value === duration)}
                onChange={(o) => setDuration(o.value)}
                isDisabled={lockedFields}
              />
              {lockedFields && (
                <p className="text-xs text-gray-500 mt-1">
                  Billing cycle cannot be edited for active plans.
                </p>
              )}
            </div>
          </div>

          {/* Features */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium">Features</label>
              <button
                type="button"
                onClick={handleAddFeature}
                className="flex items-center gap-1 px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <Plus size={16} /> Add Feature
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
                  className="flex items-center gap-2 p-2 bg-white border rounded-lg"
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
                    className="p-1 text-gray-400 hover:text-red-600 rounded"
                    disabled={features.length === 1}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Limits */}
          <div className="grid grid-cols-3 gap-3">
            <input
              type="number"
              value={maxProjects}
              onChange={(e) => setMaxProjects(e.target.value)}
              placeholder="Max Projects"
              className="px-3 py-2 border rounded-lg"
            />
            <input
              type="number"
              value={maxMembers}
              onChange={(e) => setMaxMembers(e.target.value)}
              placeholder="Max Members"
              className="px-3 py-2 border rounded-lg"
            />
            <input
              type="number"
              value={storage}
              onChange={(e) => setStorage(e.target.value)}
              placeholder="Storage (GB)"
              className="px-3 py-2 border rounded-lg"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gray-900 text-white rounded-lg"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
