'use client';

import { useEffect, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function QRScanner({ onScan, onError }) {
  const [result, setResult] = useState('');

  useEffect(() => {
    Html5Qrcode.getCameras()
      .then(devices => {
        if (devices && devices.length) {
          console.log("Available cameras:", devices);

          // Prefer non-ultrawide back camera
          const preferredCamera = devices.find(device =>
            /back|rear|environment/i.test(device.label) &&
            !/0\.5|ultra|wide/i.test(device.label)
          );

          // Fallback to first "back" camera or the first device
          const backCamera = preferredCamera ||
            devices.find(device => /back|rear|environment/i.test(device.label)) ||
            devices[0];

          const html5QrCode = new Html5Qrcode("reader", false);

          html5QrCode.start(
            backCamera.id,
            {
              fps: 10,
              qrbox: { width: 250, height: 250 }
            },
            (decodedText, decodedResult) => {
              console.log("Decoded text:", decodedText);
              setResult(decodedText)
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
    <div>
      <div id="reader" className="w-[600px]"></div>
      <p>{result}</p>
    </div>
  );
}
