// app/(dashboard)/dashboard/components/PowerChart.tsx
'use client';

import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Activity } from 'lucide-react';
import { C } from '@/lib/colors';
import CustomTooltip from './CustomTooltip';

interface PowerChartProps {
  data: Array<{
    time: string;
    power: number;
    theoretical: number;
  }>;
  height?: number;
}

export default function PowerChart({ data, height = 220 }: PowerChartProps) {
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
      <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="gPow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={C.green} stopOpacity={0.2} />
            <stop offset="95%" stopColor={C.green} stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="gTheo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={C.blue} stopOpacity={0.15} />
            <stop offset="95%" stopColor={C.blue} stopOpacity={0} />
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
          unit="W"
          width={40}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: C.border, strokeWidth: 1 }} />
        <Area
          type="monotone"
          dataKey="power"
          stroke={C.green}
          strokeWidth={2.5}
          fill="url(#gPow)"
          name="Puissance réelle"
          unit="W"
          activeDot={{ r: 4, fill: C.green }}
        />
        <Line
          type="monotone"
          dataKey="theoretical"
          stroke={C.blue}
          strokeWidth={2}
          strokeDasharray="5 5"
          name="Puissance théorique"
          unit="W"
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}