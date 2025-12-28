import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, X, Flashlight } from 'lucide-react';
import { Button } from '@/components/ui';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose?: () => void;
}

export const QRScanner = ({ onScan, onClose }: QRScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFlash, setHasFlash] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    startScanner();
    return () => stopScanner();
  }, []);

  const startScanner = async () => {
    try {
      setError(null);

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera not available');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        // Check for flash support
        const track = stream.getVideoTracks()[0];
        const capabilities = (track as any).getCapabilities?.();
        if (capabilities?.torch) {
          setHasFlash(true);
        }

        setIsScanning(true);
        // Start QR detection loop
        detectQRCode();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to access camera');
      setIsScanning(false);
    }
  };

  const stopScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsScanning(false);
  };

  const detectQRCode = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || !isScanning) return;

    const ctx = canvas.getContext('2d');
    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationFrameRef.current = requestAnimationFrame(detectQRCode);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Try jsQR for QR code detection
    try {
      // @ts-ignore - jsQR will be available
      const jsqr = require('jsqr');
      const code = jsqr(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code && code.data) {
        onScan(code.data);
        stopScanner();
        return;
      }
    } catch (err) {
      // jsQR not available, continue scanning
    }

    animationFrameRef.current = requestAnimationFrame(detectQRCode);
  };

  const toggleFlash = async () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;

    const capabilities = (track as any).getCapabilities?.();
    if (capabilities?.torch) {
      await track.applyConstraints({
        advanced: [{ torch: !flashOn }]
      } as any);
      setFlashOn(!flashOn);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-500 to-secondary-500">
        <div className="flex items-center gap-3 text-white">
          <Camera className="h-6 w-6" />
          <span className="font-semibold">QR Scanner</span>
        </div>
        <button
          onClick={onClose}
          className="text-white p-2 hover:bg-white/20 rounded-full transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Scanner View */}
      <div className="flex-1 relative overflow-hidden">
        {isScanning ? (
          <>
            {/* Camera Feed */}
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              playsInline
              muted
            />

            {/* Canvas for detection (hidden) */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Scanning Frame */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{
                  borderColor: ['#f97316', '#14b8a6', '#f97316'],
                  boxShadow: [
                    '0 0 0 0 rgba(249, 115, 22, 0.7)',
                    '0 0 0 20px rgba(249, 115, 22, 0)',
                    '0 0 0 0 rgba(249, 115, 22, 0)'
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear'
                }}
                className="w-64 h-64 border-4 rounded-3xl relative"
              >
                {/* Corner Brackets */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-xl" />
              </motion.div>
            </div>

            {/* Scanning Line Animation */}
            <motion.div
              animate={{ y: ['-100%', '100%'] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear'
              }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 w-64 h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent"
            />

            {/* Instructions */}
            <div className="absolute bottom-32 left-0 right-0 text-center">
              <p className="text-white text-lg font-medium mb-2">
                Align QR code within frame
              </p>
              <p className="text-white/70 text-sm">
                It will scan automatically
              </p>
            </div>

            {/* Flash Toggle */}
            {hasFlash && (
              <button
                onClick={toggleFlash}
                className="absolute bottom-40 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-sm p-4 rounded-full text-white"
              >
                {flashOn ? <Flashlight className="h-6 w-6 fill-white" /> : <Flashlight className="h-6 w-6" />}
              </button>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-white">
              <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">{error || 'Starting camera...'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 bg-neutral-900 flex justify-center gap-4">
        <Button
          variant="ghost"
          className="text-white"
          onClick={() => {
            const code = prompt('Enter QR code manually:');
            if (code) onScan(code);
          }}
        >
          Enter Manually
        </Button>
        <Button
          variant="ghost"
          className="text-white"
          onClick={onClose}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};
