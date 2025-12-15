# Простая архитектура метрик

## Структура

Простой подход с обычным `lazy()` импортом и `useEffect` для отправки метрик.

```
apps/root/src/
├── components/
│   ├── TasksPage.tsx   # Страница Tasks с метрикой LOAD_TASKS
│   └── OrdersPage.tsx  # Страница Orders с метрикой LOAD_ORDERS
└── bootstrap.tsx        # Использование компонентов
```

## TasksPage компонент

```typescript
import React, { Suspense, lazy, useEffect } from 'react';
import { Spin } from 'antd';
import { MetricsManager } from '@repo/metrics';

// Обычный lazy импорт
const TasksRoutes = lazy(() =>
  import('tasks/Routes').then(module => ({ default: module.TasksRoutes }))
);

export const TasksPage: React.FC = () => {
  const metrics = MetricsManager.getInstance();

  useEffect(() => {
    // Начало события LOAD_TASKS
    metrics.startAction('LOAD_TASKS', 'load');

    return () => {
      // Очистка при размонтировании
      if (metrics.isActionActive('LOAD_TASKS')) {
        metrics.leaveAction('LOAD_TASKS');
      }
    };
  }, [metrics]);

  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
        <Spin size="large" />
      </div>
    }>
      <TasksRoutes />
    </Suspense>
  );
};
```

## OrdersPage компонент

```typescript
import React, { Suspense, lazy, useEffect } from 'react';
import { Spin } from 'antd';
import { MetricsManager } from '@repo/metrics';

// Обычный lazy импорт
const OrderRoutes = lazy(() =>
  import('order/Routes').then(module => ({ default: module.OrderRoutes }))
);

export const OrdersPage: React.FC = () => {
  const metrics = MetricsManager.getInstance();

  useEffect(() => {
    // Начало события LOAD_ORDERS
    metrics.startAction('LOAD_ORDERS', 'load');

    return () => {
      // Очистка при размонтировании
      if (metrics.isActionActive('LOAD_ORDERS')) {
        metrics.leaveAction('LOAD_ORDERS');
      }
    };
  }, [metrics]);

  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
        <Spin size="large" />
      </div>
    }>
      <OrderRoutes />
    </Suspense>
  );
};
```

## Использование в bootstrap.tsx

```typescript
import { TasksPage } from './components/TasksPage';
import { OrdersPage } from './components/OrdersPage';

const App: React.FC = () => {
  return (
    <Router>
      <Switch>
        <Route path="/tasks">
          <TasksPage />
        </Route>
        <Route path="/order">
          <OrdersPage />
        </Route>
      </Switch>
    </Router>
  );
};
```

## Как это работает

### 1. Пользователь кликает на "Tasks"

```
Router переключается на /tasks
    ↓
React рендерит <TasksPage />
    ↓
useEffect выполняется
    ↓
metrics.startAction('LOAD_TASKS') - МЕТРИКА ОТПРАВЛЕНА
    ↓
Suspense начинает загрузку lazy компонента
    ↓
import('tasks/Routes') загружает chunk
    ↓
Компонент загружен и отрендерен
```

### 2. При размонтировании компонента

```
React размонтирует <TasksPage />
    ↓
useEffect cleanup выполняется
    ↓
Проверка: isActionActive('LOAD_TASKS')?
    ↓
Если да: metrics.leaveAction('LOAD_TASKS')
```

## Что вы увидите в консоли

### При навигации на /tasks

```
[⚠ FALLBACK] [dynatrace-root] ACTION_START
⏰ 2024-01-15T10:30:45.123Z
📝 Action started (fallback mode): dynatrace-root:LOAD_TASKS
📊 Data: { actionId: 1, actionType: 'load' }
```

### При размонтировании (навигация на другую страницу)

```
[⚠ FALLBACK] [dynatrace-root] ACTION_END
⏰ 2024-01-15T10:30:50.456Z
📝 Action completed (fallback mode)
📊 Data: { actionId: 1 }
```

## Преимущества

✅ **Простота** - обычный lazy импорт, знакомый всем
✅ **Явность** - useEffect четко показывает где начинается метрика
✅ **Чистота** - cleanup в return автоматически завершает действие
✅ **Гибкость** - легко добавить дополнительную логику в useEffect

## Добавление новой страницы

### 1. Создайте компонент

```typescript
// UsersPage.tsx
import React, { Suspense, lazy, useEffect } from 'react';
import { Spin } from 'antd';
import { MetricsManager } from '@repo/metrics';

const UsersRoutes = lazy(() =>
  import('users/Routes').then(module => ({ default: module.UsersRoutes }))
);

export const UsersPage: React.FC = () => {
  const metrics = MetricsManager.getInstance();

  useEffect(() => {
    metrics.startAction('LOAD_USERS', 'load');

    return () => {
      if (metrics.isActionActive('LOAD_USERS')) {
        metrics.leaveAction('LOAD_USERS');
      }
    };
  }, [metrics]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UsersRoutes />
    </Suspense>
  );
};
```

### 2. Добавьте в роутинг

```typescript
<Route path="/users">
  <UsersPage />
</Route>
```

Готово! Метрика `LOAD_USERS` будет автоматически отслеживаться.

## Важные моменты

### Почему useEffect?

`useEffect` выполняется **после первого рендера** компонента, когда:
- Компонент уже в DOM
- Suspense начал загрузку lazy компонента
- Метрика отправляется в этот момент

### Почему cleanup?

Функция в `return` выполняется при размонтировании:
- Гарантирует завершение метрики
- Избегает "висячих" действий
- Чистота и предсказуемость

### Зависимости useEffect

```typescript
useEffect(() => {
  // ...
}, [metrics]); // metrics от getInstance() всегда одинаковый (singleton)
```

Массив зависимостей `[metrics]` гарантирует что эффект выполнится один раз при монтировании.

## С Dynatrace vs без Dynatrace

### Без Dynatrace (fallback режим)

```
[⚠ FALLBACK] - префикс
- Логи в консоль
- Фейковые actionId
- Приложение работает
```

### С Dynatrace

```
[✓ DYNATRACE] - префикс
- Отправка в Dynatrace
- Реальные actionId
- Дашборд с метриками
```

## Альтернативный подход (без cleanup)

Если хотите завершать действие вручную:

```typescript
export const TasksPage: React.FC = () => {
  const metrics = MetricsManager.getInstance();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    metrics.startAction('LOAD_TASKS', 'load');
  }, [metrics]);

  useEffect(() => {
    if (loaded) {
      metrics.leaveAction('LOAD_TASKS');
    }
  }, [loaded, metrics]);

  return (
    <Suspense fallback={<Spin />}>
      <TasksRoutes onLoad={() => setLoaded(true)} />
    </Suspense>
  );
};
```

Но cleanup проще и чище!
