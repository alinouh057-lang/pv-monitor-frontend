// app/(dashboard)/dashboard/utils/parseMongoDate.ts

/**
 * Parse un timestamp MongoDB vers un objet Date.
 * Supporte : { $date: "..." } | objet Date | chaîne ISO 8601
 * Retourne null si le format est invalide.
 */
export function parseMongoDate(timestamp: any): Date | null {
  if (!timestamp) return null;

  // Format MongoDB natif : { $date: "2024-01-15T10:30:00Z" }
  if (typeof timestamp === 'object' && timestamp !== null && timestamp.$date) {
    return new Date(timestamp.$date);
  }

  // Déjà un objet Date
  if (timestamp instanceof Date) {
    return isNaN(timestamp.getTime()) ? null : timestamp;
  }

  // Chaîne ISO 8601
  if (typeof timestamp === 'string') {
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? null : date;
  }

  return null;
}