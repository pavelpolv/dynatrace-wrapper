/**
 * Типы для пакета метрик Dynatrace
 * Используется для типобезопасной работы с dtrum API
 */

/**
 * Событие метрики
 */
export interface MetricEvent {
  name: string;
  value?: number | string | boolean;
  properties?: Record<string, any>;
  timestamp?: number;
}

/**
 * Пользовательское действие
 */
export interface UserAction {
  name: string;
  duration?: number;
  properties?: Record<string, any>;
}

/**
 * Событие ошибки
 */
export interface CustomErrorEvent {
  /** Сообщение об ошибке */
  message: string;
  /** Стек вызовов (опционально) */
  stackTrace?: string;
  /** Источник ошибки - используется как eventName в Dynatrace */
  source?: string;
}

/**
 * Метрики загрузки страницы
 */
export interface PageLoadMetrics {
  pageName: string;
  customMetricsPrefix?: string;
}

/**
 * Типы событий
 */
export const MetricsEventType = {
  // Общие категории событий
  USER_ACTION: 'user-action',
  CUSTOM_EVENT: 'custom-event',
  ERROR: 'error',
  PERFORMANCE: 'performance',
  NAVIGATION: 'navigation',

  // Специфичные события приложения
  LOAD_ROOT_APP: 'LOAD_ROOT_APP',
  LOAD_HEADER: 'LOAD_HEADER',
  LOAD_SIDEBAR: 'LOAD_SIDEBAR',
  LOAD_TASKS: 'LOAD_TASKS',
  VIEW_TASKS: 'VIEW_TASKS',
  LOAD_ORDERS: 'LOAD_ORDERS',
} as const;

export type MetricsEventType = typeof MetricsEventType[keyof typeof MetricsEventType];

/**
 * Опции для инициализации менеджера метрик
 */
export interface MetricsManagerConfig {
  /** Включить/отключить сбор метрик */
  enabled?: boolean;
  /** Окружение */
  environment?: 'dev' | 'staging' | 'prod';
  /** Режим отладки (логирование в консоль) */
  debugMode?: boolean;
  /** Пользовательский префикс для имен событий */
  customPrefix?: string;
}
