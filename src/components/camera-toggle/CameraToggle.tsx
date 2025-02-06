import { useState } from 'react';
import './CameraToggle.scss';
import { isMobileDevice } from '../../utils/deviceDetection';

interface CameraToggleProps {
  onToggle: () => void;
}

export const CameraToggle: React.FC<CameraToggleProps> = ({ onToggle }) => {
  const [isFrontCamera, setIsFrontCamera] = useState(true);

  if (!isMobileDevice()) {
    return null;
  }

  const handleToggle = () => {
    setIsFrontCamera(!isFrontCamera);
    onToggle();
  };

  return (
    <button className="camera-toggle-btn" onClick={handleToggle} aria-label="Switch Camera">
      <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M20 16v4a2 2 0 0 1-2 2h-4" />
        <path d="M14 4h4a2 2 0 0 1 2 2v4" />
        <path d="M4 8V4a2 2 0 0 1 2-2h4" />
        <path d="M4 16v4a2 2 0 0 0 2 2h4" />
      </svg>
    </button>
  );
};