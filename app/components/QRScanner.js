'use client';

import { useEffect } from 'react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';

export default function QRScanner({ onScan, onError }) {

  useEffect(() => {
    // This method will trigger user permissions
    Html5Qrcode.getCameras().then(devices => {
      /**
       * devices would be an array of objects of type:
       * { id: "id", label: "label" }
       */
      if (devices && devices.length) {
        console.log(devices)
        var cameraId = devices[0].id;
        const html5QrCode = new Html5Qrcode(/* element id */ "reader", false);
        html5QrCode.start(
          cameraId, 
          {
            fps: 10,    // Optional, frame per seconds for qr code scanning
            qrbox: { width: 250, height: 250 }  // Optional, if you want bounded box UI
          },
          (decodedText, decodedResult) => {
            console.log("Decoded text:", decodedText)
            // do something when code is read
          },
          (errorMessage) => {
            // parse error, ignore it.
          })
        .catch((err) => {
          console.log("Start failed")
          // Start failed, handle it.
        });
      }
    }).catch(err => {
      // handle err
    });

    
  }, [onScan, onError]);

  return (
    <div id="reader" className="w-[600px]"></div>
  );
}
