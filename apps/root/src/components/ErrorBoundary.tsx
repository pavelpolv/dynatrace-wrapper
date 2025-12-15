import React, { Component, ReactNode, Suspense } from 'react';
import { Result, Spin } from 'antd';
import { metrics } from '@repo/metrics';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  actionName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { actionName } = this.props;

    console.error('ErrorBoundary caught an error:', error, errorInfo);
    console.error('Action name:', actionName);

    // Отправка ошибки в метрики
    metrics.reportError(error, actionName || 'ErrorBoundary');
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        // @ts-expect-error React 17 + TS 5.3 compatibility issue with Ant Design
        <Result
          status="error"
          title="Произошла ошибка"
          subTitle={this.state.error?.message || 'Что-то пошло не так'}
        />
      );
    }

    return (
      <Suspense
        fallback={
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh'
          }}>
            {/* @ts-expect-error React 17 + TS 5.3 compatibility issue with Ant Design */}
            <Spin size="large" />
          </div>
        }
      >
        {this.props.children}
      </Suspense>
    );
  }
}

export default ErrorBoundary;
