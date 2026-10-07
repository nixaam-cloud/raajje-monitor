'use client';

import React, { useState } from 'react';
import { AirlineMeta } from '@/utils/airlineLogos';

interface AirlineLogoBadgeProps {
  meta: AirlineMeta;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function AirlineLogoBadge({ meta, size = 'sm', className = '' }: AirlineLogoBadgeProps) {
  const [imgError, setImgError] = useState(false);

  // Size styling
  const sizeClasses =
    size === 'lg'
      ? 'w-9 h-9 min-w-[36px] text-xs'
      : size === 'md'
      ? 'w-7 h-7 min-w-[28px] text-[10px]'
      : 'w-6 h-6 min-w-[24px] text-[9px]';

  const logoUrl = `https://images.kiwi.com/airlines/64/${meta.code}.png`;

  return (
    <div
      className={`relative rounded-md flex items-center justify-center overflow-hidden shrink-0 border border-slate-700/80 bg-slate-900 shadow-inner ${sizeClasses} ${className}`}
      title={`${meta.name} (${meta.code})`}
      style={{
        boxShadow: `0 0 6px ${meta.brandColor}20`,
      }}
    >
      {!imgError ? (
        <img
          src={logoUrl}
          alt={meta.name}
          className="w-full h-full object-contain p-0.5"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center font-bold font-mono tracking-tighter"
          style={{
            backgroundColor: `${meta.brandColor}25`,
            color: meta.brandColor,
          }}
        >
          {meta.code.slice(0, 2)}
        </div>
      )}
    </div>
  );
}
