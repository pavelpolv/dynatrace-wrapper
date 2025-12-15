/**
 * @repo/metrics - Пакет для работы с Dynatrace метриками в микрофронтенд архитектуре
 *
 * Основные возможности:
 * - Типобезопасная обёртка над dtrum API
 * - Глобальный доступ через window.__DYNATRACE_METRICS__ для всех микрофронтендов
 * - Упрощенный объект metrics для удобного API
 * - Singleton паттерн для единого менеджера метрик
 *
 * @example
 * // Инициализация (один раз в root приложении)
 * import { MetricsManager } from '@repo/metrics';
 *
 * MetricsManager.initialize({
 *   appName: 'my-app',
 *   environment: 'dev',
 *   debugMode: true,
 * });
 *
 * @example
 * // Использование объекта metrics (рекомендуемый способ)
 * import { metrics } from '@repo/metrics';
 *
 * // Начать действие
 * metrics.startAction('CREATE_TASK');
 *
 * try {
 *   // Добавить свойства к действию
 *   metrics.addActionProperties('CREATE_TASK', {
 *     shortString: { taskType: 'urgent', priority: 'high' },
 *     javaLong: { count: 1 }
 *   });
 *
 *   await createTask();
 *   metrics.leaveAction('CREATE_TASK');
 * } catch (error) {
 *   metrics.reportError(error, 'CREATE_TASK');
 *   throw error;
 * }
 *
 * // Установить пользователя
 * metrics.identifyUser('user-123');
 */

// Основные экспорты
export { MetricsManager } from './manager';
export { DtrumWrapper } from './dtrum';

// Упрощенный объект metrics (единственный рекомендуемый способ)
export { metrics } from './api';

// Типы
export type {
  MetricEvent,
  UserAction,
  CustomErrorEvent,
  PageLoadMetrics,
  MetricsManagerConfig,
  EventType,
} from './types';
