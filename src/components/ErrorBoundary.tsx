import React from 'react';

interface Props { children: React.ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', height: '100vh', padding: 24,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          color: '#2D2A26', background: '#FBFAF7', textAlign: 'center',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>😵</div>
          <h2 style={{ fontSize: 18, marginBottom: 8 }}>出了点问题</h2>
          <p style={{ fontSize: 14, color: '#78746D', marginBottom: 20, maxWidth: 320 }}>
            {this.state.error?.message || '应用遇到了意外错误'}
          </p>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
            style={{
              padding: '10px 24px', borderRadius: 8, border: 'none',
              background: '#3D3929', color: '#FBFAF7', fontSize: 14,
              fontWeight: 600, cursor: 'pointer',
            }}
          >
            重新加载
          </button>
          <p style={{ fontSize: 11, color: '#AAA59D', marginTop: 16 }}>
            如果问题持续出现，请尝试清除浏览器数据
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
