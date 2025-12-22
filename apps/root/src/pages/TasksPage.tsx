import React, { lazy, useEffect } from 'react';
import { MetricsManager, MetricsEventType } from '@farzoom/metrics-front-lib';
import ErrorBoundary from '../components/ErrorBoundary';

// Обычный lazy импорт
const TasksRoutes = lazy(() => import('tasks/Routes').then(module => ({ default: module.TasksRoutes })));

export const TasksPage: React.FC = () => {
  const metrics = MetricsManager.getInstance();

  useEffect(() => {
    // Начало события LOAD_TASKS
    metrics.startAction(MetricsEventType.LOAD_TASKS, 'load');

    return () => {
      // Очистка при размонтировании (опционально)
      if (metrics.isActionActive(MetricsEventType.VIEW_TASKS)) {
        metrics.leaveAction(MetricsEventType.VIEW_TASKS);
      }
    };
  }, [metrics]);

  return (
    <ErrorBoundary actionName={MetricsEventType.LOAD_TASKS}>
      <TasksRoutes />
    </ErrorBoundary>
  );
};
