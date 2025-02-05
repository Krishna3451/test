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
import SidePanel from "./components/side-panel/SidePanel";
import { Altair } from "./components/altair/Altair";
import ControlTray from "./components/control-tray/ControlTray";
import cn from "classnames";
import { CameraToggle } from './components/camera-toggle/CameraToggle';
import { isMobileDevice } from './utils/deviceDetection';

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY as string;
if (typeof API_KEY !== "string") {
  throw new Error("set REACT_APP_GEMINI_API_KEY in .env");
}

const host = "generativelanguage.googleapis.com";
const uri = `wss://${host}/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent`;

function App() {
  // this video reference is used for displaying the active stream, whether that is the webcam or screen capture
  // feel free to style as you see fit
  const videoRef = useRef<HTMLVideoElement>(null);
  // either the screen capture, the video or null, if null we hide it
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [activeView, setActiveView] = useState<'main' | 'console'>(isMobileDevice() ? 'main' : 'console');

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

  const toggleView = (view: 'main' | 'console') => {
    setActiveView(view);
  };

  return (
    <div className="App">
      <LiveAPIProvider url={uri} apiKey={API_KEY}>
        <div className="streaming-console">
          {/* Desktop View - Keeping original layout */}
          {!isMobileDevice() && (
            <>
              <SidePanel />
              <main className="main-app-area">
                <div className="video-container">
                  <video
                    className={cn("stream", {
                      hidden: !videoRef.current || !videoStream,
                      mirror: facingMode === 'user'
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
              </main>
              <ControlTray
                videoRef={videoRef}
                supportsVideo={true}
                onVideoStreamChange={setVideoStream}
              />
            </>
          )}

          {/* Mobile View */}
          {isMobileDevice() && (
            <>
              <div className="mobile-tabs">
                <button 
                  className={activeView === 'main' ? 'active' : ''} 
                  onClick={() => toggleView('main')}
                >
                  Camera
                </button>
                <button 
                  className={activeView === 'console' ? 'active' : ''} 
                  onClick={() => toggleView('console')}
                >
                  Console
                </button>
              </div>

              {activeView === 'main' && (
                <main className="main-app-area">
                  <div className="video-container">
                    <video
                      className={cn("stream", {
                        hidden: !videoRef.current || !videoStream,
                        mirror: facingMode === 'user'
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
                </main>
              )}
              
              {activeView === 'console' && (
                <div className="mobile-console">
                  <SidePanel />
                </div>
              )}
            </>
          )}
        </div>
      </LiveAPIProvider>
    </div>
  );
}

export default App;
