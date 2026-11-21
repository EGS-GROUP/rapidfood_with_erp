import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

window.addEventListener('error', (event) => {
  console.error('[Global Error]', event.error || event.message);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[Unhandled Rejection]', event.reason);
});

const rootElement = document.getElementById('root');
if (rootElement) {
  try {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
  } catch (err) {
    console.error('Fatal initialization error:', err);
    rootElement.innerHTML = `
      <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0b0f19;color:#fff;font-family:sans-serif;padding:20px;">
        <div style="background:#1e293b;border:1px solid #ef4444;border-radius:12px;padding:24px;max-width:500px;text-align:center;">
          <h2 style="color:#f87171;margin-bottom:12px;">Error al inicializar la aplicación</h2>
          <p style="color:#94a3b8;font-size:0.9rem;margin-bottom:16px;">${err?.message || 'Error desconocido'}</p>
          <button onclick="localStorage.clear();sessionStorage.clear();location.reload();" style="background:#ea580c;color:white;border:none;padding:10px 16px;border-radius:6px;font-weight:bold;cursor:pointer;">Limpiar Almacenamiento y Recargar</button>
        </div>
      </div>
    `;
  }
}
