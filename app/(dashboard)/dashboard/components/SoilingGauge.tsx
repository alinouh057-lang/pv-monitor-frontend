// app/(dashboard)/dashboard/components/SoilingGauge.tsx
'use client';

import { CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { C } from '@/lib/colors';
import { statusColor, statusBg } from '@/lib/api';

interface SoilingGaugeProps {
  level: number;
  status: string;
  confidence?: number;
}

export default function SoilingGauge({ level, status, confidence }: SoilingGaugeProps) {
  const color = statusColor(status);
  const safeLevel = typeof level === 'number' && !isNaN(level) ? level : 0;
  const safeConfidence = typeof confidence === 'number' && !isNaN(confidence) ? confidence : 0;

  const segments = [
    { label: 'Clean', max: 30, color: C.green },
    { label: 'Warning', max: 60, color: C.amber },
    { label: 'Critical', max: 100, color: C.red },
  ];

  const statusIcon = {
    Clean: <CheckCircle size={14} />,
    Warning: <AlertCircle size={14} />,
    Critical: <AlertTriangle size={14} />,
  }[status] ?? <Info size={14} />;

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 6,
        }}
      >
        <span style={{ fontFamily: 'Sora, sans-serif', fontSize: 28, fontWeight: 800, color }}>
          {safeLevel.toFixed(1)}%
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {confidence && (
            <span style={{ fontSize: 11, color: C.text3 }}>
              Confiance: {(safeConfidence * 100).toFixed(0)}%
            </span>
          )}
          <span
            style={{
              padding: '4px 12px',
              borderRadius: 99,
              fontSize: 12,
              fontWeight: 700,
              background: statusBg(status),
              color,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {statusIcon} {status}
          </span>
        </div>
      </div>

      <div
        style={{
          height: 10,
          borderRadius: 99,
          background: C.surface2,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${safeLevel}%`,
            background: `linear-gradient(90deg, ${C.green}, ${color})`,
            borderRadius: 99,
            transition: 'width .8s ease',
          }}
        />
        {segments.map(s => (
          <div
            key={s.label}
            style={{
              position: 'absolute',
              top: 0,
              left: `${s.max}%`,
              height: '100%',
              width: 1,
              background: C.border,
              transform: 'translateX(-50%)',
            }}
          />
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
        {segments.map(s => (
          <span key={s.label} style={{ fontSize: 10, color: C.text3 }}>
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}