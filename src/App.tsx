/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useRef, useState } from "react";
import "./App.scss";
import { LiveAPIProvider } from "./contexts/LiveAPIContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import SidePanel from "./components/side-panel/SidePanel";
import { Altair } from "./components/altair/Altair";
import ControlTray from "./components/control-tray/ControlTray";
import Login from "./components/auth/Login";
import LogoutButton from "./components/auth/LogoutButton";
import PhoneVerification from "./components/auth/PhoneVerification";
import cn from "classnames";
import { CameraToggle } from './components/camera-toggle/CameraToggle';
import { isMobileDevice } from './utils/deviceDetection';

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY as string;
if (typeof API_KEY !== "string") {
  throw new Error("set REACT_APP_GEMINI_API_KEY in .env");
}

const host = "generativelanguage.googleapis.com";
const uri = `wss://${host}/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent`;

function AppContent() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const { user, needsPhoneVerification } = useAuth();
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const handleCameraToggle = async () => {
    if (!videoStream) return;
    
    // Stop all tracks in the current stream
    videoStream.getTracks().forEach(track => track.stop());
    
    // Toggle facing mode
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);
    
    try {
      const constraints = {
        video: {
          facingMode: { exact: newFacingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setVideoStream(newStream);
    } catch (error) {
      console.error('Error switching camera:', error);
      // If exact constraint fails, try without exact
      try {
        const fallbackConstraints = {
          video: {
            facingMode: newFacingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        };
        
        const fallbackStream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
        
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
        }
        setVideoStream(fallbackStream);
      } catch (fallbackError) {
        console.error('Fallback camera switch failed:', fallbackError);
      }
    }
  };

  if (!user) {
    return <Login />;
  }

  if (needsPhoneVerification) {
    return <PhoneVerification onVerificationComplete={() => window.location.reload()} />;
  }

  return (
    <LiveAPIProvider url={uri} apiKey={API_KEY}>
      <div className="streaming-console">
        <LogoutButton />
        {!isMobileDevice() && <SidePanel />}
        <main>
          <div className="main-app-area">
            <div className="video-container">
              <video
                className={cn("stream", {
                  hidden: !videoRef.current || !videoStream,
                  mirror: facingMode === 'user' && isMobileDevice()
                })}
                ref={videoRef}
                autoPlay
                playsInline
              />
              <CameraToggle onToggle={handleCameraToggle} />
            </div>
            
            <div className="solution-container">
              <Altair />
            </div>
          </div>

          <ControlTray
            videoRef={videoRef}
            supportsVideo={true}
            onVideoStreamChange={setVideoStream}
          >
            {/* put your own buttons here */}
          </ControlTray>
        </main>
      </div>
    </LiveAPIProvider>
  );
}

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </div>
  );
}

export default App;
