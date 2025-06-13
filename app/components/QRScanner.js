'use client';

import { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function QRScanner({ onScan, onError }) {
  const [result, setResult] = useState('');
  const html5QrCodeRef = useRef(null);
  const [cameraId, setCameraId] = useState(null);

  // Initialize and start scanner when cameraId is set
  useEffect(() => {
    if (!cameraId) return;

    if (!html5QrCodeRef.current) {
      html5QrCodeRef.current = new Html5Qrcode("reader", false);
    }

    html5QrCodeRef.current.start(
      cameraId,
      {
        fps: 10,
        qrbox: { width: 250, height: 250 }
      },
      (decodedText, decodedResult) => {
        console.log("Decoded text:", decodedText);
        setResult(decodedText);
        if (onScan) onScan(decodedText, decodedResult);
      },
      (errorMessage) => {
        if (onError) onError(errorMessage);
      }
    ).catch(err => {
      console.error("Failed to start scanner", err);
      if (onError) onError(err);
    });

    // Cleanup on unmount: stop camera
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => { });
        html5QrCodeRef.current.clear();
      }
    };
  }, [cameraId, onScan, onError]);

  // On mount: get cameras and pick the preferred one
  useEffect(() => {
    Html5Qrcode.getCameras().then(devices => {
      if (devices && devices.length) {
        // Your preferred camera logic
        const preferredCamera = devices.find(device =>
          /back|rear|environment/i.test(device.label) &&
          !/0\.5|ultra|wide/i.test(device.label)
        );

        const backCamera = preferredCamera ||
          devices.find(device => /back|rear|environment/i.test(device.label)) ||
          devices[0];

        setCameraId(backCamera.id);
      }
    }).catch(err => {
      console.error("Camera access error:", err);
      if (onError) onError(err);
    });
  }, [onError]);

  return (
    <div>
      <div id="reader"></div>
      <p>Result: {result}</p>
    </div>
  );
}
