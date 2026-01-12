
import React, { useEffect, useRef } from 'react';

interface CameraPreviewProps {
  onVideoRef: (video: HTMLVideoElement) => void;
}

const CameraPreview: React.FC<CameraPreviewProps> = ({ onVideoRef }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: 640, height: 480 },
          audio: false 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          onVideoRef(videoRef.current);
        }
      } catch (err) {
        console.error("Camera Access Denied:", err);
      }
    }

    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onVideoRef]);

  return (
    <video 
      ref={videoRef}
      autoPlay 
      playsInline 
      muted 
      className="w-full h-full object-cover scale-x-[-1]"
    />
  );
};

export default CameraPreview;
