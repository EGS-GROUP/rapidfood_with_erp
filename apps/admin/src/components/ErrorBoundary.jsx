import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Admin ErrorBoundary] Error no controlado capturado:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleClearSessionAndReload = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.warn('Error limpiando almacenamiento:', e);
    }
    window.location.reload();
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0b0f19',
          color: '#f8fafc',
          padding: '24px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            maxWidth: '600px',
            width: '100%',
            backgroundColor: '#1e293b',
            border: '1px solid #ef4444',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#f87171', marginBottom: '8px' }}>
              Error al inicializar el Panel de Administración
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginBottom: '20px', lineHeight: 1.5 }}>
              Se produjo un error de ejecución en la aplicación web. Puede restablecer la sesión guardada para recargar los componentes limpios.
            </p>

            <div style={{
              backgroundColor: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '8px',
              padding: '12px',
              textAlign: 'left',
              fontFamily: 'monospace',
              fontSize: '0.78rem',
              color: '#fca5a5',
              overflowX: 'auto',
              marginBottom: '24px',
              maxHeight: '160px'
            }}>
              {this.state.error?.toString()}
              {this.state.errorInfo?.componentStack && (
                <div style={{ color: '#64748b', marginTop: '8px', whiteSpace: 'pre-wrap' }}>
                  {this.state.errorInfo.componentStack}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={this.handleReload}
                style={{
                  padding: '10px 18px',
                  backgroundColor: '#334155',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                🔄 Recargar Página
              </button>
              <button
                onClick={this.handleClearSessionAndReload}
                style={{
                  padding: '10px 18px',
                  backgroundColor: '#ea580c',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(234, 88, 12, 0.4)'
                }}
              >
                🧹 Limpiar Sesión y Reintentar
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
