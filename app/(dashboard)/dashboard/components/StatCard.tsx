// app/(dashboard)/dashboard/components/StatCard.tsx
'use client';

import { C } from '@/lib/colors';

interface StatCardProps {
  value: number;
  unit: string;
  label: string;
  color: string;
  icon: React.ElementType;
  decimals?: number;
}

export default function StatCard({
  value,
  unit,
  label,
  color,
  icon: Icon,
  decimals = 0,
}: StatCardProps) {
  const formatted = typeof value === 'number' && !isNaN(value) ? value.toFixed(decimals) : '0';

  return (
    <div
      style={{
        background: C.surface2,
        borderRadius: 12,
        padding: '12px 8px',
        textAlign: 'center',
        transition: 'transform 0.2s ease, background 0.2s ease',
        cursor: 'default',
      }}
    >
      <div
        style={{
          fontFamily: 'Sora, sans-serif',
          fontSize: 20,
          fontWeight: 700,
          color,
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'center',
          gap: 2,
          marginBottom: 4,
        }}
      >
        <span>{formatted}</span>
        {unit && <span style={{ fontSize: 11, color: C.text3, fontWeight: 500 }}>{unit}</span>}
      </div>
      <div
        style={{
          fontSize: 10,
          color: C.text3,
          marginTop: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
        }}
      >
        <Icon size={11} color={color} />
        {label}
      </div>
    </div>
  );
}