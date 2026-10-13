import React from 'react';

const priceFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 6,
});
const compactFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 2,
});
const PAGE_SIZE = 8;

function SkeletonRows() {
  return Array.from({ length: PAGE_SIZE }, (_, index) => (
    <tr className="skeleton-row" key={`skeleton-${index}`} aria-hidden="true">
      <td><span className="skeleton skeleton--asset" /></td>
      <td><span className="skeleton skeleton--number" /></td>
      <td><span className="skeleton skeleton--number" /></td>
      <td><span className="skeleton skeleton--number" /></td>
      <td><span className="skeleton skeleton--number" /></td>
    </tr>
  ));
}

function AssetIdentity({ coin }) {
  return (
    <div className="asset-identity">
      {coin.image
        ? <img className="asset-identity__image" src={coin.image} alt="" loading="lazy" />
        : <span className="asset-identity__placeholder">{coin.symbol.slice(0, 1).toUpperCase()}</span>}
      <span className="asset-identity__text">
        <strong>{coin.name}</strong>
        <small>{coin.symbol.toUpperCase()}</small>
      </span>
    </div>
  );
}

/**
 * La tabla recibe una página ya calculada por el contenedor: el estado de
 * paginación permanece centralizado y el render solo presenta datos visibles.
 */
export default function DataTable({ coins, loading, page, pageCount, onPageChange, errorMessage }) {
  const startIndex = (page - 1) * PAGE_SIZE;

  return (
    <section className="table-card" id="markets" aria-label="Mercados de criptomonedas">
      <div className="table-scroll">
        <table className="market-table">
          <thead>
            <tr>
              <th scope="col">Activo</th>
              <th scope="col">Precio</th>
              <th scope="col">Cambio 24h</th>
              <th scope="col">Capitalización</th>
              <th scope="col">Volumen (24h)</th>
            </tr>
          </thead>
          <tbody>
            {loading && <SkeletonRows />}
            {!loading && coins.map((coin, index) => {
              const change = Number(coin.price_change_percentage_24h ?? 0);
              const positive = change >= 0;
              return (
                <tr key={coin.id}>
                  <td>
                    <div className="ranked-asset">
                      <span className="asset-rank">{startIndex + index + 1}</span>
                      <AssetIdentity coin={coin} />
                    </div>
                  </td>
                  <td className="numeric-cell">{priceFormatter.format(coin.current_price)}</td>
                  <td>
                    <span className={`table-change ${positive ? 'trend--up' : 'trend--down'}`}>
                      {positive ? '+' : ''}{change.toFixed(2)}%
                    </span>
                  </td>
                  <td className="numeric-cell">{compactFormatter.format(coin.market_cap ?? 0)}</td>
                  <td className="numeric-cell">{compactFormatter.format(coin.total_volume ?? 0)}</td>
                </tr>
              );
            })}
            {!loading && coins.length === 0 && (
              <tr>
                <td colSpan="5" className="empty-state">
                  <span aria-hidden="true">⌕</span>
                  <strong>No encontramos activos</strong>
                  <small>{errorMessage || 'Prueba con otro nombre o símbolo.'}</small>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <footer className="table-footer">
        <span>Página {page} de {Math.max(pageCount, 1)}</span>
        <div className="pagination-controls">
          <button type="button" onClick={() => onPageChange(page - 1)} disabled={page <= 1 || loading} aria-label="Página anterior">
            ←
          </button>
          <button type="button" onClick={() => onPageChange(page + 1)} disabled={page >= pageCount || loading} aria-label="Página siguiente">
            →
          </button>
        </div>
      </footer>
    </section>
  );
}
