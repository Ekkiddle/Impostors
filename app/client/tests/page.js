'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

const QRScanner = dynamic(() => import('../../components/QRScanner'), { ssr: false });

export default function QRPage() {

  return (
    <div >
      <QRScanner />
    </div>
  );
}
