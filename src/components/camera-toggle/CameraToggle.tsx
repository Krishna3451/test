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
    <button className="camera-toggle-btn" onClick={handleToggle}>
      {isFrontCamera ? '📷 Switch to Back Camera' : '🤳 Switch to Front Camera'}
    </button>
  );
}; 