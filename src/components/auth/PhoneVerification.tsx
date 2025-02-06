import { useState, useEffect } from 'react';
import { RecaptchaVerifier, PhoneAuthProvider, linkWithCredential, updateProfile } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { saveUserData } from '../../services/database';
import './PhoneVerification.scss';

interface PhoneVerificationProps {
  onVerificationComplete: () => void;
}

const PhoneVerification = ({ onVerificationComplete }: PhoneVerificationProps) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);

  useEffect(() => {
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      delete window.recaptchaVerifier;
    }

    const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'normal',
      callback: () => {
        // reCAPTCHA solved
      },
      'expired-callback': () => {
        setError('reCAPTCHA expired. Please try again.');
      }
    });

    setRecaptchaVerifier(verifier);
    verifier.render();

    return () => {
      if (verifier) {
        verifier.clear();
      }
    };
  }, []);

  const sendVerificationCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!recaptchaVerifier) {
        throw new Error('reCAPTCHA not initialized');
      }

      const formattedNumber = `+91${phoneNumber}`;
      const provider = new PhoneAuthProvider(auth);
      const verificationId = await provider.verifyPhoneNumber(
        formattedNumber,
        recaptchaVerifier
      );
      setVerificationId(verificationId);
      setStep('otp');
    } catch (error: any) {
      setError(error.message || 'Failed to send verification code');
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
        const newVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'normal',
          callback: () => {},
          'expired-callback': () => {
            setError('reCAPTCHA expired. Please try again.');
          }
        });
        setRecaptchaVerifier(newVerifier);
        newVerifier.render();
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
      const user = auth.currentUser;
      if (user) {
        await linkWithCredential(user, credential);
        
        const formattedNumber = `+91${phoneNumber}`;
        const currentName = user.displayName || '';
        const userData = {
          name: currentName,
          verifiedPhone: formattedNumber
        };

        // Update user profile
        await updateProfile(user, {
          displayName: JSON.stringify(userData)
        });

        // Save to database
        await saveUserData({
          uid: user.uid,
          email: user.email || '',
          displayName: currentName,
          phoneNumber: formattedNumber,
          photoURL: user.photoURL || '',
          lastLogin: new Date().toISOString(),
          createdAt: new Date().toISOString()
        });
        
        onVerificationComplete();
      }
    } catch (error: any) {
      setError(error.message || 'Failed to verify code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="phone-verification-container">
      <div className="phone-verification-box">
        <h2>Phone Verification</h2>
        <p>Please verify your phone number to continue</p>

        {error && <div className="error-message">{error}</div>}

        {step === 'phone' ? (
          <form onSubmit={sendVerificationCode}>
            <div className="input-group">
              <label htmlFor="phone">Phone Number</label>
              <div className="phone-input-container">
                <span className="country-code">+91</span>
                <input
                  type="tel"
                  id="phone"
                  placeholder="Enter your phone number"
                  value={phoneNumber}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/\D/g, '');
                    const truncated = cleaned.slice(0, 10);
                    setPhoneNumber(truncated);
                  }}
                  pattern="[0-9]{10}"
                  maxLength={10}
                  required
                />
              </div>
            </div>
            <div id="recaptcha-container" className="recaptcha-container"></div>
            <button type="submit" disabled={loading || phoneNumber.length !== 10}>
              {loading ? 'Sending...' : 'Send Verification Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyCode}>
            <div className="input-group">
              <label htmlFor="code">Verification Code</label>
              <input
                type="text"
                id="code"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
              />
            </div>
            <button type="submit" disabled={loading || verificationCode.length !== 6}>
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default PhoneVerification;
