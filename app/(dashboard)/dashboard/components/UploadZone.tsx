// app/(dashboard)/dashboard/components/UploadZone.tsx
'use client';

import { useState } from 'react';
import { Upload, Loader, AlertCircle } from 'lucide-react';
import { C } from '@/lib/colors';

interface UploadZoneProps {
  onResult: (result: any) => void;
}

export default function UploadZone({ onResult }: UploadZoneProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const { analyzeImage } = await import('@/lib/api');
      const result = await analyzeImage(file);

      if (result?.error) {
        setError(`Erreur: ${result.message || 'Échec de l\'analyse'}`);
      } else {
        onResult(result);
      }
    } catch {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const isError = !!error;

  return (
    <label
      style={{
        display: 'block',
        border: `2px dashed ${isError ? C.red : C.border}`,
        borderRadius: 11,
        padding: '22px 14px',
        textAlign: 'center',
        cursor: 'pointer',
        background: isError ? C.redL : C.surface2,
        color: isError ? C.red : C.text3,
        transition: 'var(--tr)',
      }}
      onMouseEnter={e => {
        if (!isError) {
          (e.currentTarget as HTMLLabelElement).style.borderColor = C.green;
          (e.currentTarget as HTMLLabelElement).style.background = C.greenL;
        }
      }}
      onMouseLeave={e => {
        if (!isError) {
          (e.currentTarget as HTMLLabelElement).style.borderColor = C.border;
          (e.currentTarget as HTMLLabelElement).style.background = C.surface2;
        }
      }}
    >
      <input
        type="file"
        accept=".jpg,.jpeg,.png"
        style={{ display: 'none' }}
        onChange={e => {
          if (e.target.files?.[0]) handleFile(e.target.files[0]);
        }}
      />
      {loading ? (
        <span
          style={{
            fontSize: 13,
            color: C.green,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <Loader size={16} className="spin" /> Analyse IA en cours…
        </span>
      ) : isError ? (
        <span
          style={{
            fontSize: 13,
            color: C.red,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <AlertCircle size={16} /> {error}
        </span>
      ) : (
        <>
          <Upload size={32} style={{ marginBottom: 8, opacity: 0.7 }} />
          <div style={{ fontSize: 12.5, fontWeight: 500 }}>Glisser une image ici</div>
          <div style={{ fontSize: 10.5, marginTop: 2 }}>JPG / PNG → Analyse IA immédiate</div>
        </>
      )}
    </label>
  );
}