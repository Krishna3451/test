import { useState } from "react";
import "./CameraToggle.scss";
import { isMobileDevice } from "../../utils/deviceDetection";

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
    <button
      className="camera-toggle-btn"
      onClick={handleToggle}
      aria-label="Switch Camera"
    >
      <svg
        fill="#FFFFFF"
        width="800px"
        height="800px"
        viewBox="0 0 32 32"
        id="Outlined"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title />

        <g id="Fill">
          <path d="M16.71,22.29l-1.42,1.42L17.59,26H16A10,10,0,0,1,8.93,8.93L7.51,7.51A12,12,0,0,0,16,28h1.59l-2.3,2.29,1.42,1.42L20,28.41a2,2,0,0,0,0-2.82Z" />

          <path d="M16,4H14.41l2.3-2.29L15.29.29,12,3.59a2,2,0,0,0,0,2.82l3.29,3.3,1.42-1.42L14.41,6H16a10,10,0,0,1,7.07,17.07l1.42,1.42A12,12,0,0,0,16,4Z" />
        </g>
      </svg>
    </button>
  );
};
