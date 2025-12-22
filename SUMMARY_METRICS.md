# Итоговая документация: Метрики с ленивой загрузкой

## Что было реализовано

### 1. Пакет @farzoom/metrics

Полнофункциональный пакет для работы с Dynatrace метриками:

**Основные возможности:**
- ✅ Работает с Dynatrace и без него (fallback режим)
- ✅ Debug режим с красивым логированием в консоль
- ✅ Автоматическая генерация actionId в fallback режиме
- ✅ Глобальный доступ через `window.__DYNATRACE_METRICS__`
- ✅ TypeScript с полной типизацией
- ✅ React хуки для удобного использования
- ✅ Утилитные функции для использования вне React

**Файлы:**
- `packages/metrics/src/` - исходный код пакета
- `packages/metrics/README.md` - полная документация API
- `packages/metrics/DEBUG_MODE.md` - руководство по debug режиму
- `packages/metrics/EXAMPLES.md` - примеры использования

### 2. Компоненты для ленивой загрузки с метриками

Созданы компоненты-обертки, которые автоматически отслеживают загрузку микрофронтендов:

**Файлы:**
- `apps/root/src/components/LazyLoadWithMetrics.tsx` - базовый компонент
- `apps/root/src/components/LazyTasksRoutes.tsx` - обертка для Tasks
- `apps/root/src/components/LazyOrderRoutes.tsx` - обертка для Orders
- `apps/root/LAZY_LOAD_METRICS.md` - документация

**Ключевая особенность:**
Метрика `LOAD_TASKS` или `LOAD_ORDERS` отправляется **ДО начала загрузки JS файлов** благодаря использованию `useState` initializer функции.

### 3. Инициализация в root приложении

**Файл:** `apps/root/src/bootstrap.tsx`

```typescript
// Инициализация метрик
MetricsManager.initialize({
  appName: 'dynatrace-root',
  environment: 'dev',
  debugMode: true,  // Включен debug режим
  enabled: true,
});

// Использование компонентов с метриками
<Route path="/tasks">
  <LazyTasksRoutes />
</Route>
<Route path="/order">
  <LazyOrderRoutes />
</Route>
```

## Как это работает

### Timeline событий при навигации на /tasks

```
1. Пользователь кликает на меню "Tasks"
   ↓
2. React Router переключается на /tasks
   ↓
3. <LazyTasksRoutes /> рендерится
   ↓
4. LazyLoadWithMetrics создается (useState)
   ↓
5. 🚀 metrics.startAction('LOAD_TASKS', 'load') - МЕТРИКА ОТПРАВЛЕНА
   ↓
6. import('tasks/Routes') начинает загрузку chunk
   ↓
7. Webpack загружает файл с сервера
   ↓
8. ✅ Файл загружен
   ↓
9. metrics.leaveAction('LOAD_TASKS') - ДЕЙСТВИЕ ЗАВЕРШЕНО
   ↓
10. <TasksRoutes /> рендерится на странице
```

### Что видно в консоли

```
🚀 Starting lazy load for action: LOAD_TASKS

[⚠ FALLBACK] [dynatrace-root] ACTION_START
⏰ 2024-01-15T10:30:45.123Z
📝 Action started (fallback mode): dynatrace-root:LOAD_TASKS
📊 Data: { actionId: 1, actionType: 'load', startTime: 1705315845123 }

✅ Lazy load completed for action: LOAD_TASKS

[⚠ FALLBACK] [dynatrace-root] ACTION_END
⏰ 2024-01-15T10:30:46.789Z
📝 Action completed (fallback mode)
📊 Data: { actionId: 1, stopTime: 1705315846789 }
```

**Время загрузки:** 46.789 - 45.123 = **1.666 секунды**

## Структура проекта

```
dynatrace/
├── packages/
│   └── metrics/                    # Пакет метрик
│       ├── src/
│       │   ├── index.ts           # Главный экспорт
│       │   ├── manager.ts         # MetricsManager
│       │   ├── dtrum.ts           # DtrumWrapper (с fallback)
│       │   ├── api.ts             # Упрощенный API (metrics объект)
│       │   ├── utils.ts           # Утилитные функции
│       │   ├── hooks.ts           # React хуки
│       │   └── types.ts           # TypeScript типы
│       ├── README.md              # Документация API
│       ├── DEBUG_MODE.md          # Руководство по debug
│       └── package.json
│
├── apps/
│   └── root/
│       ├── src/
│       │   ├── components/
│       │   │   ├── LazyLoadWithMetrics.tsx  # Базовый компонент
│       │   │   ├── LazyTasksRoutes.tsx      # Tasks с метриками
│       │   │   └── LazyOrderRoutes.tsx      # Orders с метриками
│       │   └── bootstrap.tsx                # Точка входа
│       ├── LAZY_LOAD_METRICS.md             # Документация
│       └── package.json
│
├── METRICS_USAGE.md               # Инструкция по использованию
└── SUMMARY_METRICS.md             # Этот файл
```

## Использование в других микрофронтендах

### В любом месте приложения

```typescript
import { metrics } from '@farzoom/metrics-front-lib';

// Начать действие
metrics.startAction('LOAD_DATA', 'xhr');

try {
  const data = await fetchData();
  metrics.leaveAction('LOAD_DATA');
} catch (error) {
  metrics.reportError(error, 'LOAD_DATA');
  metrics.leaveAction('LOAD_DATA');
}
```

### В React компонентах

```typescript
import { useEffect } from 'react';
import { metrics } from '@farzoom/metrics-front-lib';

export const MyComponent: React.FC = () => {
  useEffect(() => {
    // Отслеживаем монтирование компонента через действие
    metrics.startAction('COMPONENT_MOUNT');

    return () => {
      metrics.leaveAction('COMPONENT_MOUNT');
    };
  }, []);

  return <div>My Component</div>;
};
```

### Проверка статуса

```typescript
const status = metrics.getStatus();
console.log(status);
// { enabled: true, dtrumAvailable: false, mode: 'fallback' }
```

## Режимы работы

### Fallback режим (без Dynatrace)

**Когда:** `window.dtrum` недоступен

**Поведение:**
- Все метрики логируются в консоль с префиксом `⚠ FALLBACK`
- Генерируются фейковые actionId (1, 2, 3, ...)
- Приложение работает нормально
- `isReady()` возвращает `true`

**Использование:**
- Разработка без Dynatrace
- Отладка приложения
- Тестирование логики метрик

### Dynatrace режим (с Dynatrace)

**Когда:** `window.dtrum` доступен

**Поведение:**
- Метрики отправляются в Dynatrace с префиксом `✓ DYNATRACE`
- Используются реальные actionId от dtrum
- В debug режиме также логируются в консоль
- Полный мониторинг в Dynatrace дашборде

**Подключение:**
```html
<!-- apps/root/public/index.html -->
<head>
  <script src="https://your-dynatrace-url/agent.js"></script>
</head>
```

## Debug режим

### Включение

```typescript
MetricsManager.initialize({
  debugMode: true,  // Включить логи
});
```

### Типы логов

```
[✓ DYNATRACE] / [⚠ FALLBACK] - префикс режима
[app-name] - название приложения
EVENT_TYPE - тип события
⏰ timestamp - ISO timestamp
📝 message - описание события
📊 Data - данные события
```

### Типы событий

- `ACTION_START` / `ACTION_END` - начало/конец действия
- `CUSTOM_EVENT` - пользовательское событие
- `ERROR` - ошибка
- `USER_ACTION` - действие пользователя
- `USER_IDENTIFIED` - идентификация пользователя
- `PAGE_START` - начало страницы
- `MEASURE_START` / `MEASURE_END` - измерение времени

## Полезные команды

### Запуск разработки

```bash
# Запустить все приложения
npm run dev

# Запустить только root
npx turbo dev --filter=root
```

### Сборка

```bash
# Собрать все
npm run build

# Собрать только metrics
cd packages/metrics && npm run build
```

### Проверка метрик в runtime

Откройте консоль браузера:

```javascript
// Получить менеджер
const manager = window.__DYNATRACE_METRICS__;

// Проверить статус
manager.getStatus();

// Активные действия
manager.getActiveActions();

// Отключить/включить
manager.setEnabled(false);
manager.setEnabled(true);
```

## Преимущества реализации

### 1. Работает всегда
- Приложение не ломается без Dynatrace
- Fallback режим обеспечивает полную работоспособность
- Graceful degradation

### 2. Точные метрики
- Метрика начинается ДО загрузки JS
- Измеряется реальное время загрузки модуля
- Привязка ошибок к действиям

### 3. Удобная отладка
- Красивые логи с эмодзи
- Структурированный вывод
- Видно все этапы загрузки

### 4. Переиспользуемость
- `LazyLoadWithMetrics` можно использовать для любых модулей
- Легко добавить новые микрофронтенды
- Централизованная логика метрик

### 5. TypeScript
- Полная типизация
- Автодополнение в IDE
- Проверка типов на этапе компиляции

## Документация

### Основные файлы

1. **packages/metrics/README.md** - полная документация API пакета
2. **packages/metrics/DEBUG_MODE.md** - руководство по debug режиму
3. **apps/root/LAZY_LOAD_METRICS.md** - документация по ленивой загрузке
4. **METRICS_USAGE.md** - инструкция по использованию
5. **SUMMARY_METRICS.md** - этот файл (итоговая документация)

### Примеры

- **EXAMPLES.md** - примеры использования API
- **EXAMPLES_METRICS_API.md** - примеры работы с Dynatrace API

### Технические детали

- **API_CORRECTIONS.md** - особенности и ограничения Dynatrace API
- **INTEGRATION.md** - интеграция в проект
- **CHANGELOG.md** - история изменений

## Решение проблем

### Метрики не работают

1. Проверить инициализацию:
   ```javascript
   console.log(window.__DYNATRACE_METRICS__);
   ```

2. Проверить статус:
   ```javascript
   window.__DYNATRACE_METRICS__.getStatus();
   ```

3. Убедиться что `debugMode: true`

### Не вижу логов

- Проверить что `debugMode: true`
- Открыть консоль браузера
- Проверить фильтры консоли

### TypeScript ошибки

```bash
cd packages/metrics
npm run build
```

### Действия не завершаются

```javascript
// Проверить активные действия
window.__DYNATRACE_METRICS__.getActiveActions();
```

## Следующие шаги

### Добавление новых модулей

1. Создать компонент-обертку:
   ```typescript
   // LazyUsersRoutes.tsx
   export const LazyUsersRoutes: React.FC = () => {
     return (
       <LazyLoadWithMetrics
         actionName="LOAD_USERS"
         loader={() => import('users/Routes')}
       />
     );
   };
   ```

2. Использовать в роутинге:
   ```typescript
   <Route path="/users">
     <LazyUsersRoutes />
   </Route>
   ```

### Отключение debug в production

```typescript
MetricsManager.initialize({
  debugMode: process.env.NODE_ENV !== 'production',
});
```

### Добавление метрик в другие микрофронтенды

1. Добавить `@farzoom/metrics` в зависимости
2. Импортировать `metrics` из пакета
3. Использовать методы `startAction`, `leaveAction`

## Контакты и поддержка

- Вопросы: создайте issue в репозитории
- Документация: см. файлы README в пакете
- Debug: включите `debugMode: true` и проверьте консоль
