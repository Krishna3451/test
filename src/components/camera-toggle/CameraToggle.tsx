import { useEffect, useState } from 'react';
import { MdCameraRear, MdCameraFront } from 'react-icons/md';
import './camera-toggle.scss';

interface CameraToggleProps {
  onToggle: () => void;
  isActive: boolean;
}

export function CameraToggle({ onToggle, isActive }: CameraToggleProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isMobile) return null;

  return (
    <button 
      className="camera-toggle-btn"
      onClick={onToggle}
      disabled={!isActive}
    >
      <MdCameraRear className="icon rear" />
      <MdCameraFront className="icon front" />
    </button>
  );
} 