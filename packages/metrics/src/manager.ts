/**
 * Менеджер метрик - главная точка входа для всех приложений
 * Предоставляет высокоуровневое API для работы с Dynatrace метриками
 */

import { DtrumWrapper } from './dtrum';
import { MetricsManagerConfig } from './types';

/**
 * Менеджер метрик
 * Singleton паттерн - один экземпляр на всё приложение
 * Автоматически привязывается к window.__DYNATRACE_METRICS__ для доступа из всех микрофронтендов
 */
export class MetricsManager {
  private static instance: MetricsManager;
  private dtrumWrapper: DtrumWrapper;
  private config: MetricsManagerConfig;
  private isEnabled: boolean;

  // Хранилище активных действий: actionName -> { actionId, startTime }
  private activeActions: Map<string, { actionId: number; startTime: number }> = new Map();

  private constructor(config: MetricsManagerConfig) {
    this.config = config;
    this.isEnabled = config.enabled !== false;
    this.dtrumWrapper = DtrumWrapper.getInstance(config.debugMode || false);
  }

  /**
   * Инициализировать менеджер метрик (Singleton паттерн)
   * Вызывать ОДИН РАЗ при запуске приложения
   * Автоматически привязывает экземпляр к window.__DYNATRACE_METRICS__
   *
   * @param config - Конфигурация метрик
   * @returns Экземпляр менеджера
   */
  static initialize(config: MetricsManagerConfig): MetricsManager {
    if (!MetricsManager.instance) {
      MetricsManager.instance = new MetricsManager(config);

      // Привязываем к window для глобального доступа
      if (typeof window !== 'undefined') {
        window.__DYNATRACE_METRICS__ = MetricsManager.instance;
      }
    }
    return MetricsManager.instance;
  }

  /**
   * Получить экземпляр менеджера (требует предварительной инициализации)
   *
   * @throws Error если менеджер не инициализирован
   * @returns Экземпляр менеджера
   */
  static getInstance(): MetricsManager {
    if (!MetricsManager.instance) {
      throw new Error(
        'MetricsManager not initialized. Call MetricsManager.initialize() first.'
      );
    }
    return MetricsManager.instance;
  }

  /**
   * Проверить, инициализирован ли менеджер
   *
   * @returns true если инициализирован
   */
  static isInitialized(): boolean {
    return MetricsManager.instance !== undefined;
  }

  /**
   * Начать отслеживание действия пользователя (низкоуровневый API)
   * Возвращает actionId для последующего завершения через DtrumWrapper
   *
   * Рекомендуется использовать startAction/leaveAction вместо этого метода
   *
   * @param actionName - Название действия
   * @param actionType - Тип действия (load, xhr, custom)
   * @returns actionId (число) или 0 если действие не создано
   */
  enterAction(actionName: string, actionType?: string): number {
    if (!this.isEnabled) return 0;

    return this.dtrumWrapper.enterAction(actionName, actionType);
  }

  /**
   * Начать действие ПО ИМЕНИ (упрощенный API)
   * Сохраняет actionId для последующего завершения
   *
   * Использование в любом микрофронтенде:
   * ```typescript
   * metrics.startAction('LOAD_TASKS');
   * // ... выполнить работу
   * metrics.leaveAction('LOAD_TASKS');
   * ```
   *
   * @param actionName - Название действия
   * @param actionType - Тип действия (load, xhr, custom)
   */
  startAction(actionName: string, actionType?: string): void {
    if (!this.isEnabled) return;

    // Проверяем, не запущено ли уже это действие
    if (this.activeActions.has(actionName)) {
      console.warn(
        `Action "${actionName}" is already active. Skipping startAction.`
      );
      return;
    }

    const startTime = Date.now();
    const actionId = this.enterAction(actionName, actionType);

    if (actionId !== 0) {
      // Сохраняем actionId и startTime для последующего завершения
      this.activeActions.set(actionName, { actionId, startTime });
      this.log(`Action started: ${actionName} with ID ${actionId} at ${startTime}`);
    }
  }

  /**
   * Завершить действие ПО ИМЕНИ
   * Автоматически получает actionId и startTime из внутреннего хранилища
   *
   * @param actionName - Название действия
   */
  leaveAction(actionName: string): void {
    if (!this.isEnabled) return;

    const actionData = this.activeActions.get(actionName);

    if (actionData) {
      const stopTime = Date.now();
      this.dtrumWrapper.leaveAction(actionData.actionId, stopTime, actionData.startTime);
      this.activeActions.delete(actionName);
      this.log(`Action ended: ${actionName} with ID ${actionData.actionId}`, {
        duration: stopTime - actionData.startTime
      });
    } else {
      console.warn(
        `Cannot end action "${actionName}": action not found or not started`
      );
    }
  }

  /**
   * Проверить, активно ли действие
   *
   * @param actionName - Название действия
   * @returns true если действие активно
   */
  isActionActive(actionName: string): boolean {
    return this.activeActions.has(actionName);
  }

  /**
   * Добавить свойства к активному действию ПО ИМЕНИ
   * Автоматически находит actionId по названию действия
   *
   * Использование:
   * ```typescript
   * // Сначала запустить действие
   * metrics.startAction('LOAD_TASKS');
   *
   * // Добавить свойства к запущенному действию
   * metrics.addActionProperties('LOAD_TASKS', {
   *   shortString: { taskType: 'urgent', status: 'in-progress' },
   *   javaLong: { count: 42 },
   *   javaDouble: { progress: 0.75 }
   * });
   *
   * // Завершить действие
   * metrics.leaveAction('LOAD_TASKS');
   * ```
   *
   * @param actionName - Название действия
   * @param properties - Объект со свойствами, разделенными по типам
   * @param properties.javaLong - Числовые свойства (целые числа)
   * @param properties.date - Свойства типа Date
   * @param properties.shortString - Строковые свойства (макс. 100 символов)
   * @param properties.javaDouble - Числовые свойства (с плавающей точкой)
   * @returns true если свойства успешно добавлены
   */
  addActionProperties(
    actionName: string,
    properties: {
      javaLong?: Record<string, number>;
      date?: Record<string, Date>;
      shortString?: Record<string, string>;
      javaDouble?: Record<string, number>;
    }
  ): boolean {
    if (!this.isEnabled) return false;

    const actionData = this.activeActions.get(actionName);

    if (!actionData) {
      console.warn(
        `Cannot add properties to action "${actionName}": action not found or not started`
      );
      return false;
    }

    const success = this.dtrumWrapper.addActionProperties(
      actionData.actionId,
      properties.javaLong,
      properties.date,
      properties.shortString,
      properties.javaDouble
    );

    if (success) {
      this.log(`Properties added to action: ${actionName} (ID: ${actionData.actionId})`, properties);
    }

    return success;
  }



  /**
   * Отметить ошибку
   *
   * Примеры:
   * ```typescript
   * // Простая ошибка
   * metrics.trackError(new Error('Failed to fetch tasks'));
   *
   * // Ошибка с именем события
   * metrics.trackError(error, 'LOAD_TASKS');
   *
   * // Строка как ошибка
   * metrics.trackError('API connection failed', 'tasks-api');
   * ```
   *
   * @param error - Объект ошибки или строка
   * @param eventName - Название события (опционально, по умолчанию 'error')
   */
  trackError(error: Error | string, eventName: string = 'error'): void {
    if (!this.isEnabled) return;

    // Создаем объект Error
    const errorObj = typeof error === 'string' ? new Error(error) : error;

    // Автоматически определяем parentActionId из активного действия
    // Если есть активное действие с именем eventName, используем его actionId
    let parentActionId: number | undefined;
    const actionData = this.activeActions.get(eventName);
      console.log(actionData, '!!!!!!!')

      if (actionData) {
      parentActionId = actionData.actionId;
    }

    // Логируем информацию об ошибке
    this.log(`Error tracked: ${eventName}`, {
      message: errorObj.message,
      parentActionId,
    });

    // Отправляем ошибку в Dynatrace с parentActionId
    this.dtrumWrapper.reportError(errorObj, eventName, parentActionId);
  }


  /**
   * Установить пользователя для отслеживания
   *
   * @param userId - ID пользователя
   */
  setUser(userId: string): void {
    if (!this.isEnabled) return;
    this.dtrumWrapper.identifyUser(userId);
  }


  /**
   * Проверить, готов ли сервис метрик
   *
   * @returns true если dtrum доступен
   */
  isReady(): boolean {
    return this.dtrumWrapper.isReady();
  }


  /**
   * Получить список всех активных действий
   *
   * @returns Массив названий активных действий
   */
  getActiveActions(): string[] {
    return Array.from(this.activeActions.keys());
  }

  /**
   * Логирование (только в режиме отладки)
   */
  private log(message: string, data?: any): void {
    if (this.config.debugMode) {
      console.log(`[MetricsManager] ${message}`, data || '');
    }
  }

  /**
   * Получить статус Dynatrace
   * @returns true если Dynatrace доступен
   */
  isDtrumAvailable(): boolean {
    return typeof window !== 'undefined' && window.dtrum !== undefined;
  }

  /**
   * Получить информацию о статусе метрик
   */
  getStatus(): { enabled: boolean; dtrumAvailable: boolean; mode: string } {
    const dtrumAvailable = this.isDtrumAvailable();
    return {
      enabled: this.isEnabled,
      dtrumAvailable,
      mode: dtrumAvailable ? 'dynatrace' : 'fallback'
    };
  }
}
