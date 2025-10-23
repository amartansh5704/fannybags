import { useState } from 'react';
import {
  IoLogoWhatsapp,
  IoLogoTwitter,
  IoLogoFacebook,
  IoLink,
  IoClose,
} from 'react-icons/io5';

// This is the component for a single button
const ShareButton = ({ icon, text, onClick, colorClass }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-4 rounded-lg bg-fb-dark hover:bg-gray-700 transition-all duration-200 ${colorClass}`}
  >
    <span className="text-4xl mb-2">{icon}</span>
    <span className="text-sm font-medium">{text}</span>
  </button>
);

export default function ShareModal({ title, url, onClose }) {
  const [copied, setCopied] = useState(false);

  // URLs for sharing
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareOptions = [
    {
      text: 'WhatsApp',
      icon: <IoLogoWhatsapp />,
      colorClass: 'text-green-500',
      onClick: () =>
        window.open(`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`),
    },
    {
      text: 'Twitter/X',
      icon: <IoLogoTwitter />,
      colorClass: 'text-blue-400',
      onClick: () =>
        window.open(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`),
    },
    {
      text: 'Facebook',
      icon: <IoLogoFacebook />,
      colorClass: 'text-blue-600',
      onClick: () =>
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`),
    },
    {
      text: copied ? 'Copied!' : 'Copy Link',
      icon: <IoLink />,
      colorClass: copied ? 'text-fb-green' : 'text-gray-400',
      onClick: () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
    },
  ];

  return (
    // Backdrop
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      {/* Modal Card */}
      <div
        onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
        className="bg-fb-surface rounded-lg shadow-xl w-full max-w-md m-4 p-6"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Share Campaign</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <IoClose size={24} />
          </button>
        </div>

        {/* Share Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {shareOptions.map((opt) => (
            <ShareButton
              key={opt.text}
              icon={opt.icon}
              text={opt.text}
              colorClass={opt.colorClass}
              onClick={opt.onClick}
            />
          ))}
        </div>
        
        {/* URL Display */}
        <div className="mt-6">
            <label className="text-xs text-gray-400 block mb-1">Campaign URL</label>
            <input
                type="text"
                readOnly
                value={url}
                className="w-full p-2 bg-fb-dark rounded border border-gray-700 text-gray-300 text-sm"
            />
        </div>
      </div>
    </div>
  );
}