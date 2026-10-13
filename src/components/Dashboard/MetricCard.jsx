import React from 'react';

/**
 * Tarjeta de presentación reutilizable: la tendencia se representa mediante
 * texto y color, conservando una etiqueta accesible independiente del color.
 */
export default function MetricCard({ label, value, change, detail, icon, accent = 'violet' }) {
  const isPositive = Number(change) >= 0;
  const hasChange = change !== undefined && change !== null && Number.isFinite(Number(change));

  return (
    <article className={`metric-card metric-card--${accent}`}>
      <div className="metric-card__top">
        <span className="metric-card__label">{label}</span>
        <span className="metric-card__icon" aria-hidden="true">{icon}</span>
      </div>
      <div className="metric-card__value" title={value}>{value}</div>
      <div className="metric-card__footer">
        {hasChange && (
          <span className={`trend ${isPositive ? 'trend--up' : 'trend--down'}`}>
            <span aria-hidden="true">{isPositive ? '↗' : '↘'}</span>
            {Math.abs(Number(change)).toFixed(2)}%
          </span>
        )}
        <span className="metric-card__detail">{detail}</span>
      </div>
    </article>
  );
}
