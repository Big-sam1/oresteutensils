import React, { Component, ErrorInfo, ReactNode } from 'react';

interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '100vh', fontFamily: 'sans-serif',
          background: '#f9fafb', padding: '2rem', textAlign: 'center'
        }}>
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none"
            stroke="#ef4444" strokeWidth="1.5" style={{ marginBottom: '1rem' }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', margin: '0 0 .5rem' }}>
            Something went wrong
          </h1>
          <p style={{ color: '#6b7280', maxWidth: '480px', margin: '0 0 1.5rem' }}>
            The application encountered an unexpected error. Please try refreshing the page.
            If the problem persists, check that all environment variables are set correctly
            in your Vercel project settings.
          </p>
          <details style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px',
            padding: '1rem', maxWidth: '600px', width: '100%', textAlign: 'left' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 600, color: '#374151' }}>
              Error details
            </summary>
            <pre style={{ marginTop: '.75rem', fontSize: '12px', color: '#ef4444',
              whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {this.state.error?.message}
              {this.state.error?.stack ? '\n\n' + this.state.error.stack : ''}
            </pre>
          </details>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: '1.5rem', padding: '.625rem 1.5rem', background: '#1a4d2e',
              color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700,
              cursor: 'pointer', fontSize: '14px' }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
