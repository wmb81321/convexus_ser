"use client";

import { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import { X, Camera, CameraOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QRScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export default function QRScannerComponent({ onScan, onClose, isOpen }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const [hasCamera, setHasCamera] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const startScanner = async () => {
      try {
        // Check if camera is available
        const hasCamera = await QrScanner.hasCamera();
        setHasCamera(hasCamera);

        if (!hasCamera) {
          setError("No camera found. Please use a device with a camera.");
          return;
        }

        if (videoRef.current) {
          scannerRef.current = new QrScanner(
            videoRef.current,
            (result) => {
              console.log('QR Code detected:', result.data);
              onScan(result.data);
              stopScanner();
            },
            {
              highlightScanRegion: true,
              highlightCodeOutline: true,
              maxScansPerSecond: 5,
            }
          );

          await scannerRef.current.start();
          setIsScanning(true);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to start QR scanner:', err);
        setError("Failed to access camera. Please check permissions.");
      }
    };

    const stopScanner = () => {
      if (scannerRef.current) {
        scannerRef.current.stop();
        scannerRef.current.destroy();
        scannerRef.current = null;
      }
      setIsScanning(false);
    };

    startScanner();

    return () => {
      stopScanner();
    };
  }, [isOpen, onScan]);

  const handleClose = () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
    }
    setIsScanning(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Scan QR Code
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {error ? (
          <div className="text-center py-8">
            <CameraOff className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={handleClose} variant="outline">
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-64 object-cover"
                playsInline
              />
              {!isScanning && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="text-white text-center">
                    <Camera className="w-8 h-8 mx-auto mb-2" />
                    <p>Starting camera...</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Position the QR code within the frame to scan
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Make sure the QR code is well-lit and clearly visible
              </p>
            </div>

            <Button onClick={handleClose} variant="outline" className="w-full">
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}