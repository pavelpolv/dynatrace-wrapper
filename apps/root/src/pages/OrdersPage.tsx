import React, { lazy, useEffect } from 'react';
import { MetricsManager, MetricsEventType } from '@repo/metrics';
import ErrorBoundary from '../components/ErrorBoundary';

// Обычный lazy импорт
const OrderRoutes = lazy(() => import('order/Routes').then(module => ({ default: module.OrderRoutes })));

export const OrdersPage: React.FC = () => {
  const metrics = MetricsManager.getInstance();

  useEffect(() => {
    // Начало события LOAD_ORDERS
    metrics.startAction(MetricsEventType.LOAD_ORDERS, 'load');

    return () => {
      // Очистка при размонтировании (опционально)
      if (metrics.isActionActive(MetricsEventType.LOAD_ORDERS)) {
        metrics.leaveAction(MetricsEventType.LOAD_ORDERS);
      }
    };
  }, [metrics]);

  return (
    <ErrorBoundary actionName={MetricsEventType.LOAD_ORDERS}>
      <OrderRoutes />
    </ErrorBoundary>
  );
};
