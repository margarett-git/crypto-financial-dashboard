import React from 'react';
import { useEffect, useState } from 'react';

/**
 * Debounce local: mantiene fluido el campo y solo propaga la consulta tras una
 * breve pausa, reduciendo renders y evitando filtrar por cada tecla.
 */
export default function DataFilterBar({ searchTerm, onSearchChange, sortBy, onSortChange, resultCount }) {
  const [draft, setDraft] = useState(searchTerm);

  useEffect(() => setDraft(searchTerm), [searchTerm]);

  useEffect(() => {
    const timeout = setTimeout(() => onSearchChange(draft), 300);
    return () => clearTimeout(timeout);
  }, [draft, onSearchChange]);

  return (
    <div className="filter-bar">
      <label className="search-field">
        <span className="search-field__icon" aria-hidden="true">⌕</span>
        <span className="sr-only">Buscar criptomoneda</span>
        <input
          type="search"
          placeholder="Buscar activo..."
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <kbd>/</kbd>
      </label>
      <div className="filter-bar__right">
        <span className="result-count">{resultCount} activos</span>
        <label className="sort-select">
          <span className="sr-only">Ordenar activos</span>
          <select value={sortBy} onChange={(event) => onSortChange(event.target.value)}>
            <option value="market_cap">Capitalización</option>
            <option value="current_price">Precio</option>
            <option value="total_volume">Volumen</option>
            <option value="price_change_percentage_24h">Cambio 24h</option>
          </select>
        </label>
      </div>
    </div>
  );
}
