// app/(dashboard)/dashboard/hooks/useDashboardData.ts
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  fetchLatest,
  fetchHistory,
  fetchStats,
  fetchHeartbeat,
  getPanelConfig,
  fmtTime,
  type Measurement,
  type Stats,
} from '@/lib/api';
import { parseMongoDate } from '../utils/parseMongoDate';

interface UseDashboardDataProps {
  autoRefresh: boolean;
  refreshKey: number;
  timeRange: string;
  setLastUpdate: (date: Date) => void;
}

export function useDashboardData({
  autoRefresh,
  refreshKey,
  timeRange,
  setLastUpdate,
}: UseDashboardDataProps) {
  const [latest, setLatest] = useState<Measurement | null>(null);
  const [historyData, setHistoryData] = useState<Measurement[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(true);
  const [esp32Online, setEsp32Online] = useState(false);
  const [panelConfig, setPanelConfig] = useState({
    area: 1.6,
    efficiency: 0.20,
  });

  const REFRESH_INTERVAL = 30_000;

  // Chargement de la config des panneaux
  useEffect(() => {
    (async () => {
      try {
        const config = await getPanelConfig();
        if (config) {
          setPanelConfig({
            area: config.panel_area_m2 ?? 1.6,
            efficiency: config.panel_efficiency ?? 0.20,
          });
        }
      } catch {
        // valeurs par défaut déjà en place
      }
    })();
  }, []);

  const load = useCallback(async () => {
    try {
      const [l, h, s, hb] = await Promise.all([
        fetchLatest(),
        fetchHistory(0, 0),
        fetchStats(),
        fetchHeartbeat(),
      ]);

      setLatest(l);

      if (h && Array.isArray(h.data)) {
        setHistoryData(h.data);
      } else {
        setHistoryData([]);
      }

      if (s) setStats(s);
      setEsp32Online(hb);
      setConnected(true);
      setLastUpdate(new Date());
    } catch {
      setConnected(false);
      setHistoryData([]);
    } finally {
      setLoading(false);
    }
  }, [setLastUpdate]);

  // Chargement initial et auto-refresh
  useEffect(() => {
    load();
    let interval: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      interval = setInterval(load, REFRESH_INTERVAL);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [load, autoRefresh]);

  // Rechargement manuel via refreshKey
  useEffect(() => {
    if (refreshKey > 0) load();
  }, [refreshKey, load]);

  // Données du graphique (useMemo)
  const chartData = useMemo(() => {
    if (!historyData || historyData.length === 0) return [];

    let filtered = historyData;

    if (timeRange !== 'all') {
      const hoursMap: Record<string, number> = { '24h': 24, '7d': 168, '30d': 720 };
      const hours = hoursMap[timeRange] ?? 24;
      const cutoff = new Date(Date.now() - hours * 3_600_000);

      filtered = historyData.filter(d => {
        const date = parseMongoDate(d.timestamp);
        return date ? date >= cutoff : false;
      });
    }

    return filtered.map(d => {
      const power = d.electrical_data?.power_output || 0;
      const irradiance = d.electrical_data?.irradiance || 0;
      const theoretical = irradiance * panelConfig.area * panelConfig.efficiency;

      return {
        time: fmtTime(d.timestamp),
        power: Number(power.toFixed(1)),
        theoretical: Number(theoretical.toFixed(1)),
        soiling: Number((d.ai_analysis?.soiling_level || 0).toFixed(1)),
        loss: Number((Math.max(0, theoretical - power)).toFixed(1)),
      };
    }).reverse();
  }, [historyData, timeRange, panelConfig]);

  return {
    latest,
    historyData,
    stats,
    uploadResult,
    setUploadResult,
    loading,
    connected,
    esp32Online,
    panelConfig,
    chartData,
    load,  
  };
}