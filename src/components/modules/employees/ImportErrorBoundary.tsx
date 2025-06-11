
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ImportErrorBoundaryProps {
  children: React.ReactNode;
}

interface ImportErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ImportErrorBoundary extends React.Component<
  ImportErrorBoundaryProps,
  ImportErrorBoundaryState
> {
  constructor(props: ImportErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ImportErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Import Error Boundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive" className="m-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex flex-col gap-2">
            <div>אירעה שגיאה במערכת הייבוא</div>
            <div className="text-sm text-gray-600">
              {this.state.error?.message || 'שגיאה לא צפויה'}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={this.handleReset}
              className="w-fit"
            >
              נסה שוב
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}
