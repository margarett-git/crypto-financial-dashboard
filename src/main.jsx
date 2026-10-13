import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Punto de entrada único: React monta la aplicación en el nodo raíz de Vite.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
