# Ленивая загрузка с метриками

## Архитектура

Для отслеживания загрузки микрофронтендов созданы компоненты-обертки, которые автоматически отправляют метрики **ДО начала загрузки** JS файлов.

## Структура компонентов

```
apps/root/src/
├── components/
│   ├── LazyLoadWithMetrics.tsx  # Базовый компонент для ленивой загрузки
│   ├── LazyTasksRoutes.tsx      # Обертка для Tasks модуля
│   └── LazyOrderRoutes.tsx      # Обертка для Order модуля
└── bootstrap.tsx                 # Использование компонентов
```

## LazyLoadWithMetrics - Базовый компонент

Универсальный компонент для ленивой загрузки любых модулей с автоматическим отслеживанием метрик.

### Как это работает

1. **При создании компонента** (в `useState`):
   - Вызывается `metrics.startAction(actionName, 'load')` - **метрика отправляется ДО начала загрузки**
   - Создается lazy компонент с loader функцией

2. **При успешной загрузке**:
   - Вызывается `metrics.leaveAction(actionName)` - завершается действие
   - Модуль рендерится

3. **При ошибке загрузки**:
   - Вызывается `metrics.reportError(error, actionName)` - отслеживается ошибка
   - Вызывается `metrics.leaveAction(actionName)` - завершается действие
   - Ошибка пробрасывается дальше

### Код компонента

```typescript
export const LazyLoadWithMetrics: React.FC<LazyLoadWithMetricsProps> = ({
  actionName,
  loader,
  componentProps = {},
  fallback,
}) => {
  const metrics = MetricsManager.getInstance();
  const [LazyComponent] = React.useState(() => {
    // 🚀 Метрика отправляется ДО начала загрузки!
    metrics.startAction(actionName, 'load');
    console.log(`🚀 Starting lazy load for action: ${actionName}`);

    return lazy(() => {
      return loader()
        .then((module) => {
          // ✅ Завершаем действие после загрузки
          metrics.leaveAction(actionName);
          console.log(`✅ Lazy load completed for action: ${actionName}`);
          return module;
        })
        .catch((error) => {
          // ❌ Отслеживаем ошибку
          metrics.reportError(error, actionName);
          metrics.leaveAction(actionName);
          console.error(`❌ Lazy load failed for action: ${actionName}`, error);
          throw error;
        });
    });
  });

  return (
    <Suspense fallback={fallback || <DefaultFallback />}>
      <LazyComponent {...componentProps} />
    </Suspense>
  );
};
```

## Специализированные компоненты

### LazyTasksRoutes

```typescript
export const LazyTasksRoutes: React.FC = () => {
  return (
    <LazyLoadWithMetrics
      actionName="LOAD_TASKS"
      loader={() => import('tasks/Routes').then(module => ({ default: module.TasksRoutes }))}
    />
  );
};
```

### LazyOrderRoutes

```typescript
export const LazyOrderRoutes: React.FC = () => {
  return (
    <LazyLoadWithMetrics
      actionName="LOAD_ORDERS"
      loader={() => import('order/Routes').then(module => ({ default: module.OrderRoutes }))}
    />
  );
};
```

## Использование в bootstrap.tsx

```typescript
import { LazyTasksRoutes } from './components/LazyTasksRoutes';
import { LazyOrderRoutes } from './components/LazyOrderRoutes';

const App: React.FC = () => {
  return (
    <Router>
      <Switch>
        <Route path="/tasks">
          <LazyTasksRoutes />
        </Route>
        <Route path="/order">
          <LazyOrderRoutes />
        </Route>
      </Switch>
    </Router>
  );
};
```

## Что вы увидите в консоли

### При навигации на /tasks

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

### При навигации на /order

```
🚀 Starting lazy load for action: LOAD_ORDERS

[⚠ FALLBACK] [dynatrace-root] ACTION_START
⏰ 2024-01-15T10:31:23.456Z
📝 Action started (fallback mode): dynatrace-root:LOAD_ORDERS
📊 Data: { actionId: 2, actionType: 'load', startTime: 1705315883456 }

✅ Lazy load completed for action: LOAD_ORDERS

[⚠ FALLBACK] [dynatrace-root] ACTION_END
⏰ 2024-01-15T10:31:24.123Z
📝 Action completed (fallback mode)
📊 Data: { actionId: 2, stopTime: 1705315884123 }
```

### При ошибке загрузки

```
🚀 Starting lazy load for action: LOAD_TASKS

[⚠ FALLBACK] [dynatrace-root] ACTION_START
⏰ 2024-01-15T10:32:45.123Z
📝 Action started (fallback mode): dynatrace-root:LOAD_TASKS
📊 Data: { actionId: 3, actionType: 'load' }

❌ Lazy load failed for action: LOAD_TASKS ChunkLoadError: Loading chunk failed

[⚠ FALLBACK] [dynatrace-root] ERROR
⏰ 2024-01-15T10:32:46.456Z
📝 Error (fallback mode): [dynatrace-root] Loading chunk failed
📊 Data: {
  parentActionId: 3,
  source: 'LazyLoad',
  stackTrace: 'ChunkLoadError: Loading chunk...',
  properties: { actionName: 'LOAD_TASKS' }
}

[⚠ FALLBACK] [dynatrace-root] ACTION_END
⏰ 2024-01-15T10:32:46.789Z
📝 Action completed (fallback mode)
📊 Data: { actionId: 3 }
```

## Timeline событий

```
Пользователь кликает на "Tasks"
    ↓
Router переключает маршрут на /tasks
    ↓
React рендерит <LazyTasksRoutes />
    ↓
LazyLoadWithMetrics создается (useState выполняется)
    ↓
🚀 metrics.startAction('LOAD_TASKS') - МЕТРИКА ОТПРАВЛЕНА!
    ↓
lazy(() => import('tasks/Routes')) начинает загрузку JS
    ↓
Webpack загружает chunk файл с сервера
    ↓
✅ Модуль загружен успешно
    ↓
metrics.leaveAction('LOAD_TASKS') - ДЕЙСТВИЕ ЗАВЕРШЕНО
    ↓
<TasksRoutes /> рендерится на экране
```

## Преимущества этого подхода

### 1. Точное измерение времени загрузки
- Метрика начинается **ДО** начала загрузки файла
- Метрика заканчивается **ПОСЛЕ** полной загрузки
- Измеряется реальное время загрузки модуля

### 2. Автоматическое отслеживание
- Не нужно вручную вызывать метрики в каждом модуле
- Вся логика в одном месте (`LazyLoadWithMetrics`)
- Легко добавить новые модули

### 3. Обработка ошибок
- Автоматическое отслеживание ошибок загрузки
- Связь ошибки с действием через `actionName`
- Не ломает приложение

### 4. Debug режим
- Красивые логи с эмодзи: 🚀 ✅ ❌
- Видно все этапы загрузки
- Легко отладить проблемы

## Добавление нового модуля

Чтобы добавить новый модуль с метриками:

### 1. Создайте компонент-обертку

```typescript
// apps/root/src/components/LazyUsersRoutes.tsx
import React from 'react';
import { LazyLoadWithMetrics } from './LazyLoadWithMetrics';

export const LazyUsersRoutes: React.FC = () => {
  return (
    <LazyLoadWithMetrics
      actionName="LOAD_USERS"
      loader={() => import('users/Routes').then(module => ({ default: module.UsersRoutes }))}
    />
  );
};
```

### 2. Используйте в bootstrap.tsx

```typescript
import { LazyUsersRoutes } from './components/LazyUsersRoutes';

const App: React.FC = () => {
  return (
    <Switch>
      <Route path="/users">
        <LazyUsersRoutes />
      </Route>
    </Switch>
  );
};
```

Готово! Метрики будут автоматически отслеживаться.

## Кастомизация

### Кастомный fallback

```typescript
<LazyLoadWithMetrics
  actionName="LOAD_TASKS"
  loader={...}
  fallback={<div>Loading Tasks...</div>}
/>
```

### Передача пропсов в компонент

```typescript
<LazyLoadWithMetrics
  actionName="LOAD_TASKS"
  loader={...}
  componentProps={{ userId: '123' }}
/>
```

## С Dynatrace vs без Dynatrace

### Без Dynatrace (fallback режим)

```
Префикс: ⚠ FALLBACK
- Метрики логируются в консоль
- Генерируются фейковые actionId
- Приложение работает нормально
```

### С Dynatrace

```
Префикс: ✓ DYNATRACE
- Метрики отправляются в Dynatrace
- Используются реальные actionId от dtrum
- Также дублируются в консоль (если debugMode: true)
```

## Важные детали

### Почему useState?

```typescript
const [LazyComponent] = React.useState(() => {
  metrics.startAction(actionName, 'load');
  return lazy(...);
});
```

`useState` с initializer функцией выполняется **один раз** при первом рендере компонента. Это гарантирует что:
- Метрика отправляется ровно 1 раз
- Lazy import начинается сразу при создании компонента
- При ре-рендерах метрика не дублируется

### Почему не useEffect?

```typescript
// ❌ НЕ ПРАВИЛЬНО
useEffect(() => {
  metrics.startAction(actionName);
}, []);
```

`useEffect` выполняется **ПОСЛЕ** рендера, когда lazy import уже может начаться. Мы бы упустили начало загрузки!

## Мониторинг в production

Когда приложение работает с Dynatrace, вы увидите в дашборде:

- **Action Name**: `dynatrace-root:LOAD_TASKS`
- **Duration**: Время загрузки модуля
- **Type**: `load`
- **Errors**: Если загрузка не удалась

Это позволяет отслеживать:
- Время загрузки каждого микрофронтенда
- Ошибки загрузки модулей
- Влияние размера chunk на производительность
