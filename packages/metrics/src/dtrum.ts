/**
 * Обёртка для dtrum с типобезопасностью и проверками
 * Предоставляет методы для работы с Dynatrace JavaScript API
 * Поддерживает работу в режиме fallback когда Dynatrace недоступен
 *
 * Документация: https://www.dynatrace.com/support/doc/javascriptapi/doc/types/dtrum.html
 */

import { DtrumApi } from './dtrum-types';

/**
 * Обёртка для Dynatrace dtrum API
 * Singleton паттерн
 * Работает независимо от наличия Dynatrace - в debug режиме логирует все события в консоль
 */
export class DtrumWrapper {
  private static instance: DtrumWrapper;
  private debugMode: boolean = false;
  private actionIdCounter: number = 1; // Счетчик для генерации фейковых actionId

  private constructor(debugMode: boolean) {
    this.debugMode = debugMode;
    this.logInfo('DtrumWrapper initialized', { debugMode, dtrumAvailable: this.isDtrumAvailable() });
  }

  /**
   * Получить единственный экземпляр обёртки
   */
  static getInstance(debugMode: boolean = false): DtrumWrapper {
    if (!DtrumWrapper.instance) {
      DtrumWrapper.instance = new DtrumWrapper(debugMode);
    }
    return DtrumWrapper.instance;
  }

  /**
   * Проверить, доступен ли dtrum
   */
  private isDtrumAvailable(): boolean {
    return typeof window !== 'undefined' && window.dtrum !== undefined;
  }

  /**
   * Логирование событий в debug режиме
   */
  private logEvent(eventType: string, message: string, data?: any): void {
    if (this.debugMode) {
      const timestamp = new Date().toISOString();
      const prefix = this.isDtrumAvailable() ? '✓ DYNATRACE' : '⚠ FALLBACK';
      console.group(`[${prefix}] ${eventType}`);
      console.log(`⏰ ${timestamp}`);
      console.log(`📝 ${message}`);
      if (data) {
        console.log('📊 Data:', data);
      }
      console.groupEnd();
    }
  }

  /**
   * Информационное логирование
   */
  private logInfo(message: string, data?: any): void {
    if (this.debugMode) {
      console.log(`ℹ️ ${message}`, data || '');
    }
  }

  /**
   * Безопасный доступ к dtrum
   */
  private getDtrum(): DtrumApi | null {
    if (!this.isDtrumAvailable()) {
      return null;
    }
    return window.dtrum as DtrumApi;
  }

  /**
   * Начать пользовательское действие
   * Возвращает actionId, который нужно передать в leaveAction
   * Работает даже если Dynatrace недоступен (генерирует фейковый actionId)
   *
   * @param actionName - Название действия
   * @param actionType - Тип действия (load, xhr, custom, etc.)
   * @param startTime - Время начала (опционально)
   * @param sourceUrl - URL источника (опционально)
   * @returns actionId (число) - всегда возвращает валидный ID
   */
  enterAction(
    actionName: string,
    actionType?: string,
    startTime?: number,
    sourceUrl?: string
  ): number {
    const dtrum = this.getDtrum();

    if (dtrum) {
      try {
        const actionId = dtrum.enterAction(
          actionName,
          actionType,
          startTime,
          sourceUrl
        );

        this.logEvent('ACTION_START', `Action started: ${actionName}`, {
          actionId,
          actionType: actionType || 'custom',
          startTime,
          sourceUrl
        });

        return actionId || this.actionIdCounter++;
      } catch (error) {
        console.error(`Failed to enter action:`, error);
      }
    }

    // Fallback: генерируем фейковый actionId
    const fallbackActionId = this.actionIdCounter++;
    this.logEvent('ACTION_START', `Action started (fallback mode): ${actionName}`, {
      actionId: fallbackActionId,
      actionType: actionType || 'custom',
      startTime: startTime || Date.now(),
      sourceUrl
    });

    return fallbackActionId;
  }

  /**
   * Завершить пользовательское действие
   * Работает даже если Dynatrace недоступен
   *
   * @param actionId - ID действия, полученный из enterAction
   * @param stopTime - Время завершения (опционально)
   * @param startTime - Время начала (опционально)
   */
  leaveAction(actionId: number, stopTime?: number, startTime?: number): void {
    const dtrum = this.getDtrum();

    if (dtrum) {
      try {
        dtrum.leaveAction(actionId, stopTime, startTime);
        this.logEvent('ACTION_END', `Action completed`, {
          actionId,
          stopTime,
          startTime,
          duration: stopTime && startTime ? stopTime - startTime : undefined
        });
        return;
      } catch (error) {
        console.error(`Failed to leave action:`, error);
      }
    }

    // Fallback: логируем завершение действия
    this.logEvent('ACTION_END', `Action completed (fallback mode)`, {
      actionId,
      stopTime: stopTime || Date.now(),
      startTime
    });
  }


  /**
   * Отправить ошибку в Dynatrace
   * Работает даже если Dynatrace недоступен
   *
   * Сигнатура dtrum.reportError: dtrum.reportError(error, parentActionId?)
   * - error: string | Error - объект ошибки или строка с сообщением
   * - parentActionId: number (опционально) - ID родительского действия
   *
   * @param error - Объект ошибки или строка (отправляется как есть)
   * @param eventName - Название события для логирования
   * @param parentActionId - ID родительского действия (опционально)
   * @returns true если ошибка успешно отправлена
   */
  reportError(error: Error | string, eventName: string, parentActionId?: number): boolean {
    const dtrum = this.getDtrum();

    if (dtrum) {
      try {
        if (dtrum.reportError) {
          // Отправляем ошибку как есть с parentActionId
          dtrum.reportError(error, parentActionId);

          this.logEvent('ERROR', `Error reported: ${eventName}`, {
            eventName,
            parentActionId,
            error: typeof error === 'string' ? error : error.message,
            stack: typeof error === 'string' ? undefined : error.stack
          });
        }

        return true;
      } catch (err) {
        console.error(`Failed to report error:`, err);
      }
    }

    // Fallback: логируем ошибку
    this.logEvent('ERROR', `Error (fallback mode): ${eventName}`, {
      eventName,
      parentActionId,
      error: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'string' ? undefined : error.stack
    });

    return true;
  }

  /**
   * Идентифицировать пользователя
   * Работает даже если Dynatrace недоступен
   *
   * Нативный метод Dynatrace API.
   * Принимает только userId (string).
   *
   * Для добавления дополнительных данных о пользователе используйте sendSessionProperties.
   *
   * @param userId - ID пользователя
   */
  identifyUser(userId: string): boolean {
    const dtrum = this.getDtrum();

    if (dtrum) {
      try {
        if (dtrum.identifyUser) {
          dtrum.identifyUser(userId);
          this.logEvent('USER_IDENTIFIED', `User identified: ${userId}`, {
            userId
          });
        }

        return true;
      } catch (error) {
        console.error(`Failed to identify user:`, error);
      }
    }

    // Fallback: логируем идентификацию пользователя
    this.logEvent('USER_IDENTIFIED', `User identified (fallback mode): ${userId}`, {
      userId
    });
    return true;
  }

  /**
   * Добавить свойства к существующему действию
   * Позволяет обогатить действие дополнительными данными
   *
   * Dynatrace поддерживает несколько типов свойств:
   * - javaLong (числа типа long)
   * - date (объекты Date)
   * - shortString (строки, макс. 100 символов)
   * - javaDouble (числа с плавающей точкой)
   *
   * @param actionId - ID действия
   * @param javaLong - Числовые свойства (целые числа)
   * @param date - Свойства типа Date
   * @param shortString - Строковые свойства (макс. 100 символов)
   * @param javaDouble - Числовые свойства (с плавающей точкой)
   * @returns true если успешно
   */
  addActionProperties(
    actionId: number,
    javaLong?: Record<string, number>,
    date?: Record<string, Date>,
    shortString?: Record<string, string>,
    javaDouble?: Record<string, number>
  ): boolean {
    const dtrum = this.getDtrum();

    if (dtrum && dtrum.addActionProperties) {
      try {
        const result = dtrum.addActionProperties(
          actionId,
          javaLong,
          date,
          shortString,
          javaDouble
        );

        this.logEvent('ACTION_PROPERTIES', `Properties added to action ${actionId}`, {
          actionId,
          javaLong,
          date,
          shortString,
          javaDouble,
          success: result.success
        });

        return result.success;
      } catch (error) {
        console.error(`Failed to add action properties:`, error);
        return false;
      }
    }

    // Fallback: логируем добавление свойств
    this.logEvent('ACTION_PROPERTIES', `Properties added (fallback mode) to action ${actionId}`, {
      actionId,
      javaLong,
      date,
      shortString,
      javaDouble
    });
    return true;
  }

  /**
   * Получить статус доступности dtrum
   * В fallback режиме всегда возвращает true, чтобы приложение продолжало работать
   */
  isReady(): boolean {
    const available = this.isDtrumAvailable();
    if (this.debugMode && !available) {
      this.logInfo('Dynatrace not available - using fallback mode');
    }
    return true; // Всегда true, чтобы приложение работало без Dynatrace
  }

}
