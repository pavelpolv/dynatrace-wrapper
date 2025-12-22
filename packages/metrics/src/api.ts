/**
 * Упрощенное API для работы с метриками
 * Предоставляет объект metrics с удобными методами
 */

import { MetricsManager } from './manager';
import { MetricsEventType } from './types';

/**
 * Получить экземпляр MetricsManager
 * Сначала проверяет window.__DYNATRACE_METRICS__, затем singleton
 *
 * @returns MetricsManager или null если не инициализирован
 */
const getMetricsManager = (): MetricsManager | null => {
  // Сначала проверяем window (для межмикрофронтендного доступа)
  if (typeof window !== 'undefined' && window.__DYNATRACE_METRICS__) {
    return window.__DYNATRACE_METRICS__;
  }

  // Если нет в window, проверяем singleton
  if (MetricsManager.isInitialized()) {
    return MetricsManager.getInstance();
  }

  return null;
};

/**
 * Упрощенный объект для работы с метриками
 *
 * Использование:
 * ```typescript
 * import { metrics } from '@farzoom/metrics-front-lib';
 *
 * metrics.startAction('CREATE_TASK');
 * try {
 *   await createTask();
 *   metrics.leaveAction('CREATE_TASK');
 * } catch (error) {
 *   metrics.reportError(error, 'CREATE_TASK');
 *   throw error;
 * }
 * ```
 */
export const metrics = {
  /**
   * Начать действие пользователя
   *
   * @param actionName - Название действия
   * @param actionType - Тип действия (xhr, load, custom)
   */
  startAction(actionName: MetricsEventType, actionType?: string): void {
    const manager = getMetricsManager();
    if (manager) {
      manager.startAction(actionName, actionType);
    }
  },

  /**
   * Завершить действие пользователя
   *
   * @param actionName - Название действия
   */
  leaveAction(actionName: MetricsEventType): void {
    const manager = getMetricsManager();
    if (manager) {
      manager.leaveAction(actionName);
    }
  },

  /**
   * Отправить ошибку в Dynatrace
   *
   * @param error - Объект ошибки или строка
   * @param eventName - Название события (опционально)
   *
   * @example
   * // Простая ошибка
   * metrics.reportError(new Error('Failed to fetch tasks'), 'LOAD_TASKS');
   *
   * @example
   * // Ошибка со стеком вызовов
   * try {
   *   await processPayment();
   * } catch (error) {
   *   metrics.reportError(error, 'PROCESS_PAYMENT');
   * }
   */
  reportError(error: Error | string, eventName?: MetricsEventType): void {
      const manager = getMetricsManager();

    if (manager) {
      manager.trackError(error, eventName);
    }
  },

  /**
   * Идентифицировать пользователя в Dynatrace
   *
   * Устанавливает тег пользователя для отслеживания активности одного пользователя
   * в разных браузерах, устройствах и сессиях.
   *
   * Это нативный метод Dynatrace API - используйте его для идентификации пользователей.
   *
   * @param value - Идентификатор пользователя (имя, ID, email и т.д.)
   *
   * @example
   * // С ID пользователя
   * metrics.identifyUser("user123");
   *
   * @example
   * // С email
   * metrics.identifyUser("user@example.com");
   *
   * @see https://www.dynatrace.com/support/doc/javascriptapi/doc/types/dtrum.html#identifyuser
   */
  identifyUser(value: string): void {
    const manager = getMetricsManager();
    if (manager) {
      manager.setUser(value);
    }
  },

  /**
   * Проверить, активно ли действие
   *
   * @param actionName - Название действия
   * @returns true если действие активно
   */
  isActionActive(actionName: MetricsEventType): boolean {
    const manager = getMetricsManager();
    return manager ? manager.isActionActive(actionName) : false;
  },

  /**
   * Добавить свойства к активному действию
   *
   * Используйте этот метод для обогащения действий дополнительными данными.
   * Действие должно быть запущено с помощью startAction перед добавлением свойств.
   *
   * Пример:
   * ```typescript
   * metrics.startAction('LOAD_TASKS');
   * // ... выполнение загрузки
   * metrics.addActionProperties('LOAD_TASKS', {
   *   shortString: { taskType: 'urgent', source: 'api' },
   *   javaLong: { count: 42, page: 1 },
   *   javaDouble: { loadTime: 1.234 }
   * });
   * metrics.leaveAction('LOAD_TASKS');
   * ```
   *
   * @param actionName - Название действия
   * @param properties - Объект со свойствами, разделенными по типам
   * @param properties.javaLong - Целочисленные свойства
   * @param properties.date - Свойства типа Date
   * @param properties.shortString - Строковые свойства (макс. 100 символов)
   * @param properties.javaDouble - Числовые свойства с плавающей точкой
   * @returns true если свойства успешно добавлены
   */
  addActionProperties(
    actionName: MetricsEventType,
    properties: {
      javaLong?: Record<string, number>;
      date?: Record<string, Date>;
      shortString?: Record<string, string>;
      javaDouble?: Record<string, number>;
    }
  ): boolean {
    const manager = getMetricsManager();
    return manager ? manager.addActionProperties(actionName, properties) : false;
  },

  /**
   * Получить список всех активных действий
   *
   * @returns Массив названий активных действий
   */
  getActiveActions(): MetricsEventType[] {
    const manager = getMetricsManager();
    return manager ? manager.getActiveActions() : ([] as MetricsEventType[]);
  },

  /**
   * Получить статус метрик
   *
   * @returns Статус метрик или null если менеджер не инициализирован
   */
  getStatus(): { enabled: boolean; dtrumAvailable: boolean; mode: string } | null {
    const manager = getMetricsManager();
    return manager ? manager.getStatus() : null;
  },
};
