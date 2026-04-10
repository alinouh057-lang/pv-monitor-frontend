// app/(dashboard)/dashboard/components/TelemetryItem.tsx
'use client';

import { C } from '@/lib/colors';

interface TelemetryItemProps {
  icon: React.ElementType;
  value: number;
  unit: string;
  label: string;
}

export default function TelemetryItem({ icon: Icon, value, unit, label }: TelemetryItemProps) {
  const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;
  const display = unit === '' ? '--' : `${safeValue.toFixed(unit === 'A' ? 2 : 1)} ${unit}`;

  return (
    <div
      style={{
        background: C.surface2,
        borderRadius: 10,
        padding: '11px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontFamily: 'Sora, sans-serif',
          fontSize: 19,
          fontWeight: 700,
          color: C.text,
        }}
      >
        {display}
      </div>
      <div
        style={{
          fontSize: 10,
          color: C.text3,
          marginTop: 3,
          textTransform: 'uppercase',
          letterSpacing: '.5px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
        }}
      >
        <Icon size={12} />
        {label}
      </div>
    </div>
  );
}