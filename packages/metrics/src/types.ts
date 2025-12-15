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
export enum EventType {
  USER_ACTION = 'user-action',
  CUSTOM_EVENT = 'custom-event',
  ERROR = 'error',
  PERFORMANCE = 'performance',
  NAVIGATION = 'navigation',
}

/**
 * Опции для инициализации менеджера метрик
 */
export interface MetricsManagerConfig {
  /** Включить/отключить сбор метрик */
  enabled?: boolean;
  /** Название приложения (обязательно) */
  appName: string;
  /** Окружение */
  environment?: 'dev' | 'staging' | 'prod';
  /** Режим отладки (логирование в консоль) */
  debugMode?: boolean;
  /** Пользовательский префикс для имен событий */
  customPrefix?: string;
}
