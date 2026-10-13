import React from 'react';

const STATUS_LABELS = {
  syncing: 'Sincronizando',
  online: 'Online',
  fallback: 'Datos de respaldo',
  error: 'Error de red',
};

/**
 * Expone tanto el estado de transporte como la hora en que el panel terminó
 * una actualización para que un fallback nunca se confunda con datos live.
 */
export default function ApiStatusBadge({ status, updatedAt, message }) {
  const label = STATUS_LABELS[status] ?? STATUS_LABELS.error;
  const timeLabel = updatedAt
    ? new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(updatedAt)
    : '—';

  return (
    <div className={`api-status api-status--${status}`} title={message || label}>
      <span className="api-status__dot" aria-hidden="true" />
      <span className="api-status__label">{label}</span>
      <span className="api-status__time">Actualizado {timeLabel}</span>
    </div>
  );
}
