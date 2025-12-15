/**
 * TypeScript типы для Dynatrace dtrum API
 * Основано на официальной документации:
 * https://www.dynatrace.com/support/doc/javascriptapi/doc/types/dtrum.html
 */

/**
 * Карта свойств для передачи в dtrum
 */
export type PropertyMap<T> = Record<string, T>;

/**
 * Объект свойств для sendSessionProperties
 */
export interface PropertyObject {
  [key: string]: number | Date | string;
}

/**
 * Результат отправки свойств
 */
export interface PropertiesSendingReport {
  success: boolean;
}

/**
 * Результат actionName
 */
export interface ActionNameResult {
  actionId: number;
}

/**
 * Объект пользовательского ввода
 */
export interface DtRumUserInput {
  id: number;
  type: string;
}

/**
 * Метаданные страницы
 */
export interface MetaData {
  name: string;
  value: string;
}

/**
 * Объект для установки новой страницы
 */
export interface PageInfo {
  group?: string;
  name: string;
}

/**
 * Полный интерфейс dtrum API
 */
export interface DtrumApi {
  // ============================================
  // Actions
  // ============================================

  /**
   * Установить имя действия
   * @param actionName - Название действия
   * @param actionId - ID действия (опционально)
   */
  actionName(actionName: string, actionId?: number): ActionNameResult;

  /**
   * Добавить слушатель входа в действие
   * @param listener - Функция обратного вызова
   */
  addEnterActionListener(
    listener: (
      actionId: number,
      starttime: number,
      isRootAction: boolean,
      element?: string | EventTarget
    ) => void
  ): void;

  /**
   * Добавить слушатель выхода из действия
   * @param listener - Функция обратного вызова
   */
  addLeaveActionListener(
    listener: (actionId: number, stoptime: number, isRootAction: boolean) => void
  ): void;

  /**
   * Начать отслеживание пользовательского ввода
   * @param domNode - DOM элемент или селектор
   * @param type - Тип ввода
   * @param addInfo - Дополнительная информация
   * @param validTime - Время валидности
   */
  beginUserInput(
    domNode: string | HTMLElement,
    type: string,
    addInfo?: string,
    validTime?: number
  ): DtRumUserInput;

  /**
   * Завершить отслеживание пользовательского ввода
   * @param userInputObject - Объект пользовательского ввода
   */
  endUserInput(userInputObject: DtRumUserInput): void;

  /**
   * Начать пользовательское действие
   * @param actionName - Название действия
   * @param actionType - Тип действия (load, xhr, custom)
   * @param startTime - Время начала (опционально)
   * @param sourceUrl - URL источника (опционально)
   * @returns ID действия (0 если не создано)
   */
  enterAction(
    actionName: string,
    actionType?: string,
    startTime?: number,
    sourceUrl?: string
  ): number;

  /**
   * Начать XHR действие
   * @param type - Тип запроса
   * @param xmode - Режим (0 | 1 | 3)
   * @param xhrUrl - URL запроса
   * @returns ID действия
   */
  enterXhrAction(type: string, xmode?: 0 | 1 | 3, xhrUrl?: string): number;

  /**
   * Войти в XHR callback
   * @param actionId - ID действия
   */
  enterXhrCallback(actionId: number): void;

  /**
   * Завершить пользовательское действие
   * @param actionId - ID действия
   * @param stopTime - Время остановки (опционально)
   * @param startTime - Время начала (опционально)
   */
  leaveAction(actionId: number, stopTime?: number, startTime?: number): void;

  /**
   * Завершить XHR действие
   * @param actionId - ID действия
   * @param stopTime - Время остановки (опционально)
   */
  leaveXhrAction(actionId: number, stopTime?: number): void;

  /**
   * Выйти из XHR callback
   * @param actionId - ID действия
   */
  leaveXhrCallback(actionId: number): void;

  /**
   * Удалить слушатель входа в действие
   * @param listener - Функция обратного вызова
   */
  removeEnterActionListener(
    listener: (
      actionId: number,
      starttime: number,
      isRootAction: boolean,
      element?: string | EventTarget
    ) => void
  ): void;

  /**
   * Удалить слушатель выхода из действия
   * @param listener - Функция обратного вызова
   */
  removeLeaveActionListener(
    listener: (actionId: number, stoptime: number, isRootAction: boolean) => void
  ): void;

  /**
   * Включить/выключить автоматическое определение действий
   * @param enabled - true для включения
   */
  setAutomaticActionDetection(enabled: boolean): void;

  // ============================================
  // Custom Reporting
  // ============================================

  /**
   * Добавить свойства к действию
   * @param parentActionId - ID родительского действия
   * @param javaLong - Числовые свойства (long)
   * @param date - Свойства типа Date
   * @param shortString - Строковые свойства
   * @param javaDouble - Числовые свойства (double)
   * @returns Отчет об отправке
   */
  addActionProperties(
    parentActionId: number,
    javaLong?: PropertyMap<number>,
    date?: PropertyMap<Date>,
    shortString?: PropertyMap<string>,
    javaDouble?: PropertyMap<number>
  ): PropertiesSendingReport;

  /**
   * Включить ручное определение страниц
   */
  enableManualPageDetection(): void;

  /**
   * Получить и оценить метаданные
   * @returns Массив метаданных
   */
  getAndEvaluateMetaData(): MetaData[];

  /**
   * Идентифицировать пользователя
   * @param value - ID пользователя
   */
  identifyUser(value: string): void;

  /**
   * Отметить страницу как ошибочную
   * @param responseCode - Код ответа HTTP
   * @param message - Сообщение об ошибке
   * @returns true если успешно
   */
  markAsErrorPage(responseCode: number, message: string): boolean;

  /**
   * Отметить XHR как неудачный
   * @param responseCode - Код ответа HTTP
   * @param message - Сообщение об ошибке
   * @param parentActionId - ID родительского действия (опционально)
   * @returns true если успешно
   */
  markXHRFailed(responseCode: number, message: string, parentActionId?: number): boolean;

  /**
   * Отправить пользовательскую ошибку
   * @param key - Ключ ошибки
   * @param value - Значение ошибки
   * @param hint - Подсказка (опционально)
   * @param parentingInfo - Информация о родителе (опционально)
   */
  reportCustomError(
    key: string,
    value: string,
    hint?: string,
    parentingInfo?: number | boolean
  ): void;

  /**
   * Отправить ошибку
   * @param error - Объект ошибки или строка
   * @param parentActionId - ID родительского действия (опционально)
   */
  reportError(error: string | Error, parentActionId?: number): void;

  /**
   * Отправить свойства сессии
   * @param javaLongOrObject - Объект свойств или числовые свойства (long)
   * @param date - Свойства типа Date
   * @param shortString - Строковые свойства
   * @param javaDouble - Числовые свойства (double)
   * @returns Отчет об отправке
   */
  sendSessionProperties(
    javaLongOrObject?: PropertyObject | PropertyMap<number>,
    date?: PropertyMap<Date>,
    shortString?: PropertyMap<string>,
    javaDouble?: PropertyMap<number>
  ): PropertiesSendingReport;

  /**
   * Установить новую страницу
   * @param newPage - Информация о странице
   * @returns ID действия
   */
  setPage(newPage: PageInfo): number;

  // ============================================
  // Lifecycle
  // ============================================

  /**
   * Добавить слушатель покидания страницы
   * @param listener - Функция обратного вызова
   */
  addPageLeavingListener(listener: (unloadRunning: boolean) => void): void;

  /**
   * Добавить слушатель таймаута визита
   * @param listener - Функция обратного вызова
   */
  addVisitTimeoutListener(
    listener: (visitId: string, newVisitAfterTimeout: boolean) => void
  ): void;

  /**
   * Отключить dtrum
   */
  disable(): void;

  /**
   * Отключить постоянные значения
   * @param remember - Запомнить состояние
   */
  disablePersistentValues(remember: boolean): void;

  /**
   * Отключить Session Replay
   */
  disableSessionReplay(): void;

  /**
   * Включить dtrum
   */
  enable(): void;

  /**
   * Включить постоянные значения
   */
  enablePersistentValues(): void;

  /**
   * Включить Session Replay
   * @param ignoreCostControl - Игнорировать контроль затрат
   */
  enableSessionReplay(ignoreCostControl: boolean): void;

  /**
   * Завершить сессию
   */
  endSession(): void;

  /**
   * Отправить beacon
   * @param forceSync - Принудительная синхронизация
   * @param sendPreview - Отправить превью
   * @param killUnfinished - Убить незавершенные
   */
  sendBeacon(forceSync: boolean, sendPreview: boolean, killUnfinished: boolean): void;

  // ============================================
  // Utilities & Load Management
  // ============================================

  /**
   * Увеличить счетчик маркеров завершения загрузки
   */
  incrementOnLoadEndMarkers(): void;

  /**
   * Установить завершение загрузки вручную
   */
  setLoadEndManually(): void;

  /**
   * Сигнализировать о завершении загрузки
   */
  signalLoadEnd(): void;

  /**
   * Сигнализировать о завершении onLoad
   */
  signalOnLoadEnd(): void;

  /**
   * Сигнализировать о начале onLoad
   */
  signalOnLoadStart(): void;

  /**
   * Получить текущее время (performance.now())
   * @returns Время в миллисекундах
   */
  now(): number;
}

/**
 * Глобальное расширение window с типизированным dtrum
 */
declare global {
  interface Window {
    dtrum?: DtrumApi;
  }
}
