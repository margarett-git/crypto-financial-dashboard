import React from 'react';
import MetricCard from './MetricCard.jsx';

// Se comparte un formateador compacto para que las métricas globales mantengan
// la misma convención monetaria que los importes de la tabla.
const compactUsd = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 2,
});

export default function MetricGrid({ globalMetrics, leader }) {
  // CoinGecko puede devolver campos opcionales; los guiones evitan cifras
  // inventadas mientras llega una respuesta válida o un objeto de respaldo.
  const globalData = globalMetrics?.data ?? {};
  const totalMarketCap = globalData.total_market_cap?.usd;
  const totalVolume = globalData.total_volume?.usd;
  const marketChange = globalData.market_cap_change_percentage_24h_usd;

  return (
    <section className="metric-grid" aria-label="Resumen del mercado">
      <MetricCard
        label="Capitalización total"
        value={Number.isFinite(totalMarketCap) ? compactUsd.format(totalMarketCap) : '—'}
        change={marketChange}
        detail="vs. últimas 24 horas"
        icon="◈"
        accent="violet"
      />
      <MetricCard
        label="Volumen en 24h"
        value={Number.isFinite(totalVolume) ? compactUsd.format(totalVolume) : '—'}
        detail="volumen global negociado"
        icon="↗"
        accent="blue"
      />
      <MetricCard
        label="Activo líder"
        value={leader ? leader.name : '—'}
        change={leader?.price_change_percentage_24h}
        detail={leader ? `${leader.symbol.toUpperCase()} · ${new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(leader.current_price)}` : 'por capitalización'}
        icon="✦"
        accent="mint"
      />
    </section>
  );
}
