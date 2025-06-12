'use client';

import { useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function QRScanner({ onScan, onError }) {
  useEffect(() => {
    Html5Qrcode.getCameras()
      .then(devices => {
        if (devices && devices.length) {
          console.log("Available cameras:", devices);

          // Try to find the back camera
          const backCamera = devices.find(device =>
            /back|rear|environment/i.test(device.label)
          );

          const cameraId = backCamera?.id || devices[0].id; // fallback to first if not found
          const html5QrCode = new Html5Qrcode("reader", false);

          html5QrCode.start(
            cameraId,
            {
              fps: 10,
              qrbox: { width: 250, height: 250 }
            },
            (decodedText, decodedResult) => {
              console.log("Decoded text:", decodedText);
              if (onScan) onScan(decodedText, decodedResult);
            },
            (errorMessage) => {
              //console.warn("QR scan error:", errorMessage);
              if (onError) onError(errorMessage);
            }
          ).catch((err) => {
            console.error("QR code scanner failed to start:", err);
          });
        }
      })
      .catch(err => {
        console.error("Camera access error:", err);
        if (onError) onError(err);
      });

  }, [onScan, onError]);

  return (
    <div id="reader" className="w-full"></div>
  );
}
