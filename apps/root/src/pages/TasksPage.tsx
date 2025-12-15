import React, { lazy, useEffect } from 'react';
import { MetricsManager } from '@repo/metrics';
import ErrorBoundary from '../components/ErrorBoundary';

// Обычный lazy импорт
const TasksRoutes = lazy(() => import('tasks/Routes').then(module => ({ default: module.TasksRoutes })));

export const TasksPage: React.FC = () => {
  const metrics = MetricsManager.getInstance();

  useEffect(() => {
    // Начало события LOAD_TASKS
    metrics.startAction('LOAD_TASKS', 'load');

    return () => {
      // Очистка при размонтировании (опционально)
      if (metrics.isActionActive('VIEW_TASKS')) {
        metrics.leaveAction('VIEW_TASKS');
      }
    };
  }, [metrics]);

  return (
    <ErrorBoundary actionName="LOAD_TASKS">
      <TasksRoutes />
    </ErrorBoundary>
  );
};
