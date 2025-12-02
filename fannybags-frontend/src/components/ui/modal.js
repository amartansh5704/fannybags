export default function Modal({ open, onClose, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[9999]">
      <div className="bg-[#0F0F0F] p-8 rounded-2xl border border-gray-700 shadow-2xl w-full max-w-lg relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl"
        >
          ✕
        </button>

        {children}
      </div>
    </div>
  );
}
