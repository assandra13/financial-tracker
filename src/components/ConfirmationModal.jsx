import React from "react";
import { AlertTriangle, Info, CheckCircle, X } from "lucide-react";

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", type = "info" }) => {
  if (!isOpen) return null;

  const typeConfig = {
    info: {
      icon: Info,
      color: "text-blue-600 bg-blue-100",
      button: "bg-blue-600 hover:bg-blue-700",
    },
    danger: {
      icon: AlertTriangle,
      color: "text-red-600 bg-red-100",
      button: "bg-red-600 hover:bg-red-700",
    },
    success: {
      icon: CheckCircle,
      color: "text-green-600 bg-green-100",
      button: "bg-green-600 hover:bg-green-700",
    },
  };

  const config = typeConfig[type];
  const IconComponent = config.icon;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-auto transform transition-all duration-500 scale-100">
        <div className="flex items-center space-x-4 mb-4">
          <div className={`p-3 rounded-xl ${config.color}`}>
            <IconComponent className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-gray-600 mt-1">{message}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex space-x-3 mt-6">
          <button onClick={onClose} className="flex-1 py-3 text-gray-700 bg-gray-100 rounded-xl font-medium hover:bg-gray-200 transition-all duration-300">
            Batal
          </button>
          <button onClick={onConfirm} className={`flex-1 py-3 text-white rounded-xl font-medium transition-all duration-300 ${config.button}`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
