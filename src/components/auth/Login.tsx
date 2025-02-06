import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../lib/firebase';
import './Login.scss';

const Login = () => {
  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Welcome to Apka Mitra</h1>
        <p>Your Personal Assistant</p>
        <button className="google-signin-btn" onClick={handleGoogleSignIn}>
          <img src="/google-icon.svg" alt="Google" />
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
