import { ArrowLeft } from "lucide-react";

const BackButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="px-5 py-2 flex items-center gap-1 justify-center font-normal text-md text-gray-200 bg-black hover:bg-gray-900 rounded-lg transition-colors"
    >
      <ArrowLeft size={16} />
      Back
    </button>
  );
};

export default BackButton;
