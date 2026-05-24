// components/HistoryTable.tsx
'use client';
import { CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { fmtDateTime, statusColor, statusBg, type Measurement } from '@/lib/api';
import { C } from '@/lib/colors';

interface HistoryTableProps {
  data: Measurement[];
  sortField: 'timestamp' | 'soiling' | 'power';
  sortDirection: 'asc' | 'desc';
  onSort: (field: 'timestamp' | 'soiling' | 'power') => void;
  selectedRows: string[];
  onSelectRow: (id: string) => void;
  onSelectAll: () => void;
}

// ============================================================
// FONCTION UTILITAIRE POUR FORMATER LES NOMBRES EN SÉCURITÉ
// ============================================================
const safeToFixed = (value: number | undefined | null, decimals: number = 1): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return '—';
  }
  return value.toFixed(decimals);
};

export default function HistoryTable({
  data,
  sortField,
  sortDirection,
  onSort,
  selectedRows,
  onSelectRow,
  onSelectAll,
}: HistoryTableProps) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
        <thead>
          <tr>
            <th style={{ padding: '9px 13px', width: 30 }}>
              <input type="checkbox" checked={selectedRows.length === data.length && data.length > 0} onChange={onSelectAll} />
            </th>
            {['Timestamp','Device','Statut','Ensablement','Confiance','Puissance','Tension','Courant'].map(h => (
              <th
                key={h}
                onClick={() => {
                  if (h === 'Ensablement') onSort('soiling');
                  if (h === 'Puissance') onSort('power');
                  if (h === 'Timestamp') onSort('timestamp');
                }}
                style={{
                  padding: '9px 13px',
                  fontSize: 10,
                  fontWeight: 700,
                  color: C.text3,
                  textTransform: 'uppercase',
                  letterSpacing: .7,
                  borderBottom: `1px solid ${C.border}`,
                  textAlign: 'left',
                  whiteSpace: 'nowrap',
                  cursor: (h === 'Ensablement' || h === 'Puissance' || h === 'Timestamp') ? 'pointer' : 'default',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {h}
                  {sortField === (h === 'Ensablement' ? 'soiling' : h === 'Puissance' ? 'power' : h === 'Timestamp' ? 'timestamp' : '') && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={9} style={{ padding: '28px', textAlign: 'center', color: C.text3 }}>Aucune donnée</td></tr>
          ) : data.map((doc, index) => {
            const ai = doc.ai_analysis || {};      // ← fallback si undefined
            const ed = doc.electrical_data || {};  // ← fallback si undefined
            const sc = statusColor(ai.status || 'Clean');
            const StatusIcon = ai.status === 'Clean' ? CheckCircle : ai.status === 'Warning' ? AlertTriangle : AlertCircle;
            return (
              <tr key={`row-${doc._id || `${doc.timestamp}-${doc.device_id}`}-${index}`} style={{ background: index % 2 === 0 ? C.surface2 : C.surface }}>
                <td style={{ padding: '9px 13px' }}>
                  <input type="checkbox" checked={selectedRows.includes(doc._id || '')} onChange={() => onSelectRow(doc._id || '')} />
                </td>
                <td style={{ padding: '9px 13px', whiteSpace: 'nowrap', fontSize: 12 }}>{fmtDateTime(doc.timestamp)}</td>
                <td style={{ padding: '9px 13px', fontFamily: 'monospace', fontSize: 11.5 }}>{doc.device_id}</td>
                <td style={{ padding: '9px 13px' }}>
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: 99,
                    fontSize: 11,
                    fontWeight: 700,
                    background: statusBg(ai.status || 'Clean'),
                    color: sc,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    width: 'fit-content'
                  }}>
                    <StatusIcon size={12} />
                    {ai.status || 'Unknown'}
                  </span>
                </td>
                {/* ✅ ENSABLEMENT - avec safeToFixed */}
                <td style={{ padding: '9px 13px', fontWeight: 700, color: sc }}>
                  {safeToFixed(ai.soiling_level, 1)}%
                </td>
                {/* ✅ CONFIANCE - avec safeToFixed */}
                <td style={{ padding: '9px 13px' }}>
                  {ai.confidence !== undefined ? safeToFixed(ai.confidence * 100, 1) : '—'}%
                </td>
                {/* ✅ PUISSANCE - avec safeToFixed */}
                <td style={{ padding: '9px 13px' }}>
                  {safeToFixed(ed.power_output, 1)} W
                </td>
                {/* ✅ TENSION - avec safeToFixed */}
                <td style={{ padding: '9px 13px' }}>
                  {safeToFixed(ed.voltage, 1)} V
                </td>
                {/* ✅ COURANT - avec safeToFixed (2 décimales) */}
                <td style={{ padding: '9px 13px' }}>
                  {safeToFixed(ed.current, 2)} A
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
