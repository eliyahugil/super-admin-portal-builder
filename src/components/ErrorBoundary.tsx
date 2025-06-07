
import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} />;
    }

    return this.props.children;
  }
}

const DefaultErrorFallback: React.FC<{ error?: Error }> = ({ error }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
    <div className="text-center p-6">
      <h1 className="text-2xl font-bold text-red-600 mb-4">שגיאה במערכת</h1>
      <p className="text-gray-600 mb-4">אירעה שגיאה בטעינת המערכת</p>
      <button 
        onClick={() => window.location.reload()} 
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        טען מחדש
      </button>
      {process.env.NODE_ENV === 'development' && error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded text-left">
          <pre className="text-xs text-red-800">{error.message}</pre>
        </div>
      )}
    </div>
  </div>
);
