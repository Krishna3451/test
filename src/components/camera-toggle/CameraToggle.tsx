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
        fill="currentColor"
      >
        <path d="M12 3C8.49 3 5.28 4.29 2.9 6.4L1 4.5V11H7.5L5.2 8.7C7.16 7.03 9.6 6 12 6C16.41 6 20 9.59 20 14H23C23 8.04 18.05 3 12 3M12 21C15.51 21 18.72 19.71 21.1 17.6L23 19.5V13H16.5L18.8 15.3C16.84 16.97 14.4 18 12 18C7.59 18 4 14.41 4 10H1C1 15.96 5.95 21 12 21Z"/>
      </svg>
    </button>
  );
}; 