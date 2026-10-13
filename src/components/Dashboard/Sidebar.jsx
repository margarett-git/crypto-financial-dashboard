import React from 'react';

const NAV_ITEMS = [
  { label: 'Overview', icon: '▦', target: 'overview' },
  { label: 'Markets', icon: '◫', target: 'markets' },
];

/**
 * La navegación comunica el destino al contenedor y usa anclas para mantener
 * una SPA ligera; el mismo componente se convierte en drawer en pantallas
 * pequeñas mediante el estado mobileOpen.
 */
export default function Sidebar({ activeView, onNavigate, theme, onToggleTheme, mobileOpen, onClose }) {
  return (
    <>
      {mobileOpen && <button className="sidebar-backdrop" aria-label="Cerrar menú" onClick={onClose} />}
      <aside className={`sidebar ${mobileOpen ? 'sidebar--open' : ''}`} aria-label="Navegación principal">
        <a className="brand" href="#overview" onClick={() => onNavigate('overview')}>
          <span className="brand__mark">C<span>.</span></span>
          <span className="brand__name">finova<span>ANALYTICS</span></span>
        </a>
        <div className="sidebar__section-label">WORKSPACE</div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <button
              className={`sidebar-nav__item ${activeView === item.target ? 'is-active' : ''}`}
              key={item.target}
              type="button"
              onClick={() => {
                onNavigate(item.target);
                onClose();
                document.getElementById(item.target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              <span className="sidebar-nav__icon" aria-hidden="true">{item.icon}</span>
              {item.label}
              {item.target === 'markets' && <span className="sidebar-nav__badge">LIVE</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar__bottom">
          <div className="sidebar-note">
            <span className="sidebar-note__icon">✦</span>
            <strong>Market insights</strong>
            <p>Todos tus activos, en una sola vista.</p>
          </div>
          <button className="theme-toggle" type="button" onClick={onToggleTheme}>
            <span aria-hidden="true">{theme === 'dark' ? '☼' : '◐'}</span>
            <span>{theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}</span>
          </button>
          <div className="sidebar-profile">
            <div className="profile-avatar">A</div>
            <div><strong>Analyst</strong><small>Personal workspace</small></div>
            <span className="profile-menu" aria-hidden="true">···</span>
          </div>
        </div>
      </aside>
    </>
  );
}
