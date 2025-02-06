import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';
import './LogoutButton.scss';

const LogoutButton = () => {
  const { user, userName } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogoutClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleCancelLogout = () => {
    setShowConfirm(false);
  };

  if (!user) return null;

  return (
    <div className="logout-container">
      <span className="user-name">{userName}</span>
      <button className="logout-button" onClick={handleLogoutClick}>
        Logout
      </button>

      {showConfirm && (
        <div className="logout-confirm-overlay">
          <div className="logout-confirm-modal">
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to log out?</p>
            <div className="button-group">
              <button className="cancel-button" onClick={handleCancelLogout}>
                Cancel
              </button>
              <button className="confirm-button" onClick={handleConfirmLogout}>
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogoutButton;
