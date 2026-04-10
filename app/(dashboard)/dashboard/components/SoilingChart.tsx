// app/(dashboard)/dashboard/components/SoilingChart.tsx
'use client';

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Activity } from 'lucide-react';
import { C } from '@/lib/colors';
import CustomTooltip from './CustomTooltip';

interface SoilingChartProps {
  data: Array<{
    time: string;
    soiling: number;
  }>;
  height?: number;
}

export default function SoilingChart({ data, height = 180 }: SoilingChartProps) {
  if (data.length === 0) {
    return (
      <div
        style={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: C.surface2,
          borderRadius: 8,
          color: C.text3,
          fontSize: 13,
        }}
      >
        <Activity size={20} style={{ marginRight: 8, opacity: 0.5 }} />
        Aucune donnée disponible
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="gSoil" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={C.amber} stopOpacity={0.25} />
            <stop offset="95%" stopColor={C.amber} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={C.border} strokeOpacity={0.6} />
        <XAxis
          dataKey="time"
          stroke={C.text3}
          tick={{ fontSize: 10, fill: C.text3 }}
          tickLine={false}
          axisLine={{ stroke: C.border }}
          padding={{ left: 10, right: 10 }}
        />
        <YAxis
          stroke={C.text3}
          tick={{ fontSize: 10, fill: C.text3 }}
          tickLine={false}
          axisLine={false}
          unit="%"
          domain={[0, 100]}
          width={35}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: C.border, strokeWidth: 1 }} />
        <Area
          type="monotone"
          dataKey="soiling"
          stroke={C.amber}
          strokeWidth={2.5}
          fill="url(#gSoil)"
          name="Ensablement"
          unit="%"
          activeDot={{ r: 4, fill: C.amber }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}