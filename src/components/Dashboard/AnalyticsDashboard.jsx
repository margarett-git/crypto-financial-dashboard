import React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getGlobalMetrics, getMarkets } from '../../services/cryptoApi.js';
import ApiStatusBadge from './ApiStatusBadge.jsx';
import DataFilterBar from './DataFilterBar.jsx';
import DataTable from './DataTable.jsx';
import MetricGrid from './MetricGrid.jsx';
import Sidebar from './Sidebar.jsx';

const PAGE_SIZE = 8;
const PREFERENCES_KEY = 'finova-dashboard-preferences';

function readPreferences() {
  try {
    const stored = JSON.parse(localStorage.getItem(PREFERENCES_KEY) || '{}');
    return {
      theme: stored.theme === 'dark' ? 'dark' : 'light',
      sortBy: typeof stored.sortBy === 'string' ? stored.sortBy : 'market_cap',
    };
  } catch {
    // Una preferencia dañada no debe impedir el uso del dashboard.
    return { theme: 'light', sortBy: 'market_cap' };
  }
}

export default function AnalyticsDashboard() {
  const [preferences, setPreferences] = useState(readPreferences);
  const [marketResult, setMarketResult] = useState(null);
  const [globalResult, setGlobalResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('syncing');
  const [updatedAt, setUpdatedAt] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [activeView, setActiveView] = useState('overview');
  const [mobileOpen, setMobileOpen] = useState(false);

  const loadDashboard = useCallback(async (signal) => {
    setLoading(true);
    setStatus('syncing');
    const [markets, global] = await Promise.all([
      getMarkets({ signal }),
      getGlobalMetrics({ signal }),
    ]);
    if (signal?.aborted) return;

    setMarketResult(markets);
    setGlobalResult(global);
    const warnings = [markets.warning, global.warning].filter(Boolean);
    setStatus(warnings.length ? 'fallback' : 'online');
    setErrorMessage(warnings.join(' '));
    setUpdatedAt(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadDashboard(controller.signal);
    return () => controller.abort();
  }, [loadDashboard]);

  // Preferencias persistidas en una única clave para evitar escrituras dispersas.
  useEffect(() => {
    try {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
    } catch {
      // El modo privado o una política del navegador puede bloquear el storage.
      // Las preferencias siguen disponibles en memoria durante esta sesión.
    }
  }, [preferences]);

  useEffect(() => {
    document.documentElement.dataset.theme = preferences.theme;
  }, [preferences.theme]);

  const coins = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase();
    const rows = (marketResult?.data ?? []).filter((coin) => (
      !query
      || coin.name.toLocaleLowerCase().includes(query)
      || coin.symbol.toLocaleLowerCase().includes(query)
    ));
    return rows.sort((a, b) => Number(b[preferences.sortBy] ?? 0) - Number(a[preferences.sortBy] ?? 0));
  }, [marketResult, preferences.sortBy, searchTerm]);

  const pageCount = Math.ceil(coins.length / PAGE_SIZE);
  const pageCoins = useMemo(
    () => coins.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [coins, page],
  );
  const leader = useMemo(
    () => (marketResult?.data ?? []).reduce((top, coin) => (
      !top || coin.market_cap > top.market_cap ? coin : top
    ), null),
    [marketResult],
  );

  const updateSearch = useCallback((value) => {
    setSearchTerm(value);
    setPage(1);
  }, []);
  const updateSort = useCallback((value) => {
    setPreferences((current) => ({ ...current, sortBy: value }));
    setPage(1);
  }, []);
  const toggleTheme = useCallback(() => {
    setPreferences((current) => ({ ...current, theme: current.theme === 'dark' ? 'light' : 'dark' }));
  }, []);

  return (
    <div className="dashboard-shell">
      <Sidebar
        activeView={activeView}
        onNavigate={setActiveView}
        theme={preferences.theme}
        onToggleTheme={toggleTheme}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <main className="dashboard-main" id="overview">
        <header className="topbar">
          <button className="mobile-menu-button" type="button" aria-label="Abrir navegación" onClick={() => setMobileOpen(true)}>
            <span />
            <span />
            <span />
          </button>
          <div className="breadcrumb"><span>Workspace</span><span className="breadcrumb__separator">/</span><strong>Overview</strong></div>
          <div className="topbar__right">
            <ApiStatusBadge status={status} updatedAt={updatedAt} message={errorMessage} />
            <button className="refresh-button" type="button" onClick={() => loadDashboard()} disabled={loading} aria-label="Actualizar datos" title="Actualizar datos">
              <span className={loading ? 'refresh-spin' : ''} aria-hidden="true">↻</span>
            </button>
          </div>
        </header>

        <div className="dashboard-content">
          <section className="page-heading">
            <div>
              <div className="eyebrow"><span className="eyebrow__dot" /> MARKET OVERVIEW</div>
              <h1>Market overview<span>.</span></h1>
              <p>Una visión clara del mercado cripto, en tiempo real.</p>
            </div>
            <div className="heading-date">
              <span className="heading-date__icon" aria-hidden="true">▦</span>
              <span>{new Intl.DateTimeFormat('es-ES', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }).format(new Date())}</span>
            </div>
          </section>

          {errorMessage && (
            <div className="data-notice" role="status">
              <span aria-hidden="true">ⓘ</span>
              <span>{errorMessage} Los valores de respaldo son ilustrativos.</span>
            </div>
          )}

          <MetricGrid globalMetrics={globalResult?.data} leader={leader} />

          <section className="market-section">
            <div className="section-heading">
              <div>
                <div className="section-heading__title-row">
                  <h2>Top cryptocurrencies</h2>
                  <span className="live-tag"><span /> LIVE</span>
                </div>
                <p>Seguimiento de los activos digitales más importantes</p>
              </div>
              <button className="export-button" type="button" onClick={() => window.print()}>
                <span aria-hidden="true">⇩</span> Exportar
              </button>
            </div>
            <DataFilterBar
              searchTerm={searchTerm}
              onSearchChange={updateSearch}
              sortBy={preferences.sortBy}
              onSortChange={updateSort}
              resultCount={coins.length}
            />
            <DataTable
              coins={pageCoins}
              loading={loading}
              page={page}
              pageCount={pageCount}
              onPageChange={(nextPage) => setPage(Math.min(Math.max(nextPage, 1), Math.max(pageCount, 1)))}
              errorMessage={errorMessage}
            />
          </section>
          <footer className="dashboard-footer">Datos de mercado proporcionados por CoinGecko <span>·</span> Para fines informativos</footer>
        </div>
      </main>
    </div>
  );
}
