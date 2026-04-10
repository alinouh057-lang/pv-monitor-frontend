// app/(dashboard)/dashboard/page.tsx
'use client';

import { useState } from 'react';
import {
  Sun,
  WifiOff,
  RefreshCw,
  Tag,
  Zap,
  TrendingDown,
  Target,
  Thermometer,
  Camera,
  Satellite,
  BarChart3,
  Activity,
  TrendingUp,
  Search,
  Power,
  Plug,
  Database,
  AlertTriangle,
} from 'lucide-react';
import { C } from '@/lib/colors';
import { statusColor, fmtDateTime } from '@/lib/api';
import { useRefresh } from '@/contexts/RefreshContext';
import { useDashboardReset } from '@/contexts/DashboardContext';

// Composants
import KpiCard from './components/KpiCard';
import SoilingGauge from './components/SoilingGauge';
import TelemetryItem from './components/TelemetryItem';
import UploadZone from './components/UploadZone';
import TimeRangeSelector from './components/TimeRangeSelector';
import StatCard from './components/StatCard';
import PowerChart from './components/PowerChart';
import SoilingChart from './components/SoilingChart';

// Hook personnalisé
import { useDashboardData } from './hooks/useDashboardData';

export default function DashboardPage() {
  const { autoRefresh, setLastUpdate, refreshKey } = useRefresh();
  const { isReset, clearResetFlag } = useDashboardReset();
  const [timeRange, setTimeRange] = useState('24h');

  // Réinitialisation du dashboard
  if (isReset) {
    clearResetFlag();
  }

  const {
    latest,
    uploadResult,
    setUploadResult,
    loading,
    connected,
    esp32Online,
    panelConfig,
    chartData,
    stats,
    load,
  } = useDashboardData({
    autoRefresh,
    refreshKey,
    timeRange,
    setLastUpdate,
  });

  // Analyse IA (fallbacks)
  const ai = latest?.ai_analysis ?? {
    soiling_level: 0,
    status: 'Clean',
    confidence: 0,
    model_version: '—',
  };

  // Données électriques (fallbacks)
  const ed = latest?.electrical_data ?? {
    voltage: 0,
    current: 0,
    power_output: 0,
    irradiance: 0,
    temperature: 0,
  };

  const b64 = latest?.media?.image_b64;
  const noData = !esp32Online || !latest;

  // Calculs
  const theoreticalPower = (ed.irradiance || 0) * panelConfig.area * panelConfig.efficiency;
  const loss = Math.max(0, theoreticalPower - (ed.power_output || 0));
  const statusColorValue = statusColor(ai.status || 'Clean');
  const performanceRatio = theoreticalPower > 0 ? ((ed.power_output || 0) / theoreticalPower) * 100 : 0;
  const temperature = ed.temperature || 25;

  // Production journalière
  const dailyProduction = stats?.averages?.avg_power ? (stats.averages.avg_power || 0) * 24 / 1000 : 0;

  // Averages
  const defaultAverages = {
    avg_power: 0, avg_soiling: 0, avg_voltage: 0,
    avg_current: 0, avg_irradiance: 0, avg_temperature: 0,
  };
  const averages = stats?.averages || defaultAverages;

  // Total mesures
  const totalMeasurements = stats?.total ?? 0;

  const fmt = (v: number, dec = 0) => {
    if (noData) return '--';
    if (typeof v !== 'number' || isNaN(v)) return '0';
    return v.toFixed(dec);
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '60vh',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: `3px solid ${C.greenL}`,
            borderTop: `3px solid ${C.green}`,
            animation: 'spin 1s linear infinite',
          }}
        />
        <span style={{ color: C.text3, fontSize: 13 }}>Connexion au backend…</span>
      </div>
    );
  }

  return (
    <div>
      {/* En-tête */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: C.text,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Sun size={24} color={C.amber} />
            Dashboard PV
          </h1>
          {esp32Online && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: C.greenL,
                padding: '4px 10px',
                borderRadius: 99,
                fontSize: 11,
                color: C.green,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: C.green,
                  animation: 'pulse-ring 1.5s ease-out infinite',
                }}
              />
              Live · {latest?.timestamp ? fmtDateTime(latest.timestamp) : ''}
            </div>
          )}
        </div>
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      </div>

      {/* Bannière de connexion */}
      {(!connected || noData) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderLeft: `4px solid ${C.amber}`,
            borderRadius: 12,
            padding: '14px 18px',
            marginBottom: 20,
          }}
        >
          <WifiOff size={22} color={C.amber} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: C.amber, fontSize: 14 }}>
              {!connected ? 'Backend inaccessible' : 'ESP32 non connecté'}
            </div>
            <div style={{ fontSize: 12, color: C.text3, marginTop: 2 }}>
              {!connected
                ? 'Impossible de joindre le serveur — vérifier que uvicorn tourne'
                : 'Carte hors tension ou WiFi perdu'}
            </div>
          </div>
          <button
            onClick={load}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              border: `1px solid ${C.amber}`,
              background: C.amberL,
              color: C.amber,
              fontSize: 12,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <RefreshCw size={12} />
            Réessayer
          </button>
        </div>
      )}

      {/* 6 KPIs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: 16,
          marginBottom: 20,
        }}
      >
        <KpiCard
          icon={Tag}
          label="ENSABLEMENT IA"
          value={fmt(ai.soiling_level, 1)}
          unit={noData ? '' : '%'}
          badge={noData ? 'En attente' : ai.status || 'Clean'}
          accentColor={noData ? C.text3 : statusColorValue}
          delay="0s"
        />
        <KpiCard
          icon={Zap}
          label="PUISSANCE"
          value={fmt(ed.power_output)}
          unit={noData ? '' : 'W'}
          badge={noData ? 'En attente' : 'Réelle'}
          accentColor={noData ? C.text3 : C.blue}
          delay=".05s"
        />
        <KpiCard
          icon={TrendingDown}
          label="PERTE"
          value={fmt(loss)}
          unit={noData ? '' : 'W'}
          badge={noData ? 'En attente' : 'Estimée'}
          accentColor={noData ? C.text3 : loss > 30 ? C.red : C.amber}
          delay=".10s"
        />
        <KpiCard
          icon={Target}
          label="PERFORMANCE"
          value={noData ? '--' : performanceRatio.toFixed(0)}
          unit={noData ? '' : '%'}
          badge={noData ? 'En attente' : 'PR'}
          accentColor={noData ? C.text3 : performanceRatio > 80 ? C.green : C.amber}
          delay=".15s"
        />
        <KpiCard
          icon={Sun}
          label="PROD. JOURNALIÈRE"
          value={noData ? '--' : dailyProduction.toFixed(1)}
          unit={noData ? '' : 'kWh'}
          badge={noData ? 'En attente' : 'Estimée'}
          accentColor={noData ? C.text3 : C.purple}
          delay=".20s"
        />
        <KpiCard
          icon={Thermometer}
          label="TEMPÉRATURE"
          value={noData ? '--' : temperature.toFixed(1)}
          unit="°C"
          badge={noData ? 'En attente' : 'Module'}
          accentColor={noData ? C.text3 : C.blue}
          delay=".25s"
        />
      </div>

      {/* Grille principale 2 colonnes */}
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 16 }}>
        {/* Colonne gauche */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Image ESP32 + Jauge */}
          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 14,
              padding: 20,
            }}
          >
            <div
              style={{
                fontSize: 9.5,
                fontWeight: 700,
                color: C.text3,
                letterSpacing: 1,
                textTransform: 'uppercase',
                marginBottom: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.green }} />
              <Camera size={14} /> IMAGE ESP32
            </div>
            {b64 ? (
              <img
                src={`data:image/jpeg;base64,${b64}`}
                alt="panneau"
                style={{ width: '100%', borderRadius: 9, objectFit: 'cover', maxHeight: 190 }}
              />
            ) : (
              <div
                style={{
                  background: C.surface2,
                  borderRadius: 9,
                  padding: '32px 14px',
                  textAlign: 'center',
                  color: C.text3,
                }}
              >
                <Satellite size={32} style={{ marginBottom: 6, opacity: 0.7 }} />
                <div style={{ fontSize: 13, fontWeight: 500 }}>En attente ESP32…</div>
              </div>
            )}
            <div style={{ height: 1, background: C.border, margin: '16px 0' }} />
            <div
              style={{
                fontSize: 9.5,
                fontWeight: 700,
                color: C.text3,
                letterSpacing: 1,
                textTransform: 'uppercase',
                marginBottom: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.green }} />
              <BarChart3 size={14} /> NIVEAU ENSABLEMENT
            </div>
            <SoilingGauge level={ai.soiling_level} status={ai.status} confidence={ai.confidence} />
          </div>

          {/* Télémétrie */}
          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 14,
              padding: 20,
            }}
          >
            <div
              style={{
                fontSize: 9.5,
                fontWeight: 700,
                color: C.text3,
                letterSpacing: 1,
                textTransform: 'uppercase',
                marginBottom: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.blue }} />
              <Activity size={14} /> TÉLÉMÉTRIE
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
              <TelemetryItem icon={Zap} value={noData ? 0 : ed.voltage} unit="V" label="Tension" />
              <TelemetryItem icon={Plug} value={noData ? 0 : ed.current} unit="A" label="Courant" />
              <TelemetryItem icon={Sun} value={noData ? 0 : ed.irradiance} unit="W/m²" label="Irradiance" />
              <TelemetryItem icon={Power} value={noData ? 0 : ed.power_output} unit="W" label="Puissance" />
            </div>
          </div>

          {/* Upload zone */}
          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 14,
              padding: 20,
            }}
          >
            <div
              style={{
                fontSize: 9.5,
                fontWeight: 700,
                color: C.text3,
                letterSpacing: 1,
                textTransform: 'uppercase',
                marginBottom: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.green }} />
              <Search size={14} /> ANALYSE MANUELLE
            </div>
            <UploadZone onResult={setUploadResult} />
            {uploadResult && (
              <div
                style={{
                  background: C.surface2,
                  borderRadius: 9,
                  padding: 11,
                  marginTop: 9,
                }}
              >
                <div
                  style={{
                    height: 3,
                    background: statusColor(uploadResult.status),
                    borderRadius: 2,
                    marginBottom: 8,
                  }}
                />
                {uploadResult.image_b64 && (
                  <img
                    src={`data:image/jpeg;base64,${uploadResult.image_b64}`}
                    alt="analyse"
                    style={{
                      width: '100%',
                      borderRadius: 7,
                      maxHeight: 130,
                      objectFit: 'cover',
                      marginBottom: 8,
                    }}
                  />
                )}
                <span
                  style={{
                    fontFamily: 'Sora',
                    fontSize: 22,
                    fontWeight: 800,
                    color: statusColor(uploadResult.status),
                  }}
                >
                  {uploadResult.soiling_level?.toFixed(1)}%
                </span>
                <span style={{ fontSize: 13, color: C.text2, marginLeft: 6 }}>— {uploadResult.status}</span>
                <div style={{ fontSize: 11, color: C.text3, marginTop: 2 }}>
                  Confiance : {uploadResult.confidence?.toFixed(1)}%
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Colonne droite */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Graphique puissance */}
          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 14,
              padding: 20,
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: C.text3,
                letterSpacing: 1,
                textTransform: 'uppercase',
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <TrendingUp size={14} color={C.green} />
              PUISSANCE : RÉELLE vs THÉORIQUE
            </div>
            <PowerChart data={chartData} height={220} />
          </div>

          {/* Graphique ensablement */}
          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 14,
              padding: 20,
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: C.text3,
                letterSpacing: 1,
                textTransform: 'uppercase',
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <TrendingDown size={14} color={C.amber} />
              ÉVOLUTION DE L'ENSABLEMENT
            </div>
            <SoilingChart data={chartData} height={180} />
          </div>

          {/* Statistiques */}
          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 14,
              padding: 20,
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: C.text3,
                letterSpacing: 1,
                textTransform: 'uppercase',
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <BarChart3 size={14} color={C.blue} />
              STATISTIQUES GLOBALES
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              <StatCard
                value={totalMeasurements}
                unit=""
                label="Mesures totales"
                color={C.green}
                icon={Database}
              />
              <StatCard
                value={averages.avg_power ?? 0}
                unit="W"
                label="Puissance moy."
                color={C.blue}
                icon={Zap}
                decimals={0}
              />
              <StatCard
                value={averages.avg_soiling ?? 0}
                unit="%"
                label="Ensablement moy."
                color={C.amber}
                icon={AlertTriangle}
                decimals={1}
              />
              <StatCard
                value={averages.avg_voltage ?? 0}
                unit="V"
                label="Tension moy."
                color={C.purple}
                icon={Activity}
                decimals={1}
              />
            </div>
          </div>

          {/* Config panneaux + Analyse IA */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 14,
                padding: '16px 20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Tag size={16} color={C.green} />
                <span style={{ fontSize: 12, fontWeight: 600, color: C.text2 }}>Configuration Panneaux</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 11 }}>
                <div>
                  <span style={{ color: C.text3 }}>Surface</span>
                  <br />
                  <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: C.text }}>
                    {panelConfig.area} m²
                  </span>
                </div>
                <div>
                  <span style={{ color: C.text3 }}>Rendement</span>
                  <br />
                  <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: C.text }}>
                    {(panelConfig.efficiency * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 14,
                padding: '16px 20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Search size={16} color={C.green} />
                <span style={{ fontSize: 12, fontWeight: 600, color: C.text2 }}>Analyse IA</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 11 }}>
                <div>
                  <span style={{ color: C.text3 }}>Pertes estimées</span>
                  <br />
                  <span
                    style={{
                      fontFamily: 'Sora, sans-serif',
                      fontWeight: 700,
                      color: loss > 10 ? C.red : C.text,
                    }}
                  >
                    {fmt(loss, 1)} W
                  </span>
                </div>
                <div>
                  <span style={{ color: C.text3 }}>Performance</span>
                  <br />
                  <span
                    style={{
                      fontFamily: 'Sora, sans-serif',
                      fontWeight: 700,
                      color: performanceRatio > 80 ? C.green : C.amber,
                    }}
                  >
                    {performanceRatio.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        .fade-up {
          animation: fadeUp 0.4s ease both;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}