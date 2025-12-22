# Инструкция по использованию метрик

## Что сделано

### 1. Инициализация метрик в Root приложении

В файле `apps/root/src/bootstrap.tsx` добавлена инициализация:

```typescript
import { MetricsManager } from '@farzoom/metrics-front-lib';

// Инициализация метрик (один раз при старте приложения)
MetricsManager.initialize({
  appName: 'dynatrace-root',
  environment: 'dev',
  debugMode: true,  // Включить debug режим для отладки
  enabled: true,    // Метрики включены
});

// Вывести статус метрик в консоль
const metricsManager = MetricsManager.getInstance();
console.log('=== Dynatrace Metrics Status ===');
console.log('Status:', metricsManager.getStatus());
console.log('Ready:', metricsManager.isReady());
```

### 2. Отслеживание загрузки приложения

В компоненте `App` добавлено отслеживание монтирования:

```typescript
const App: React.FC = () => {
  // Отследить загрузку root приложения
  React.useEffect(() => {
    metricsManager.pageViewStart('RootApp');
  }, []);

  // ...
};
```

## Как запустить и проверить

### 1. Запустить приложение

```bash
# Из корня проекта
npm run dev
```

### 2. Открыть консоль браузера

После запуска в консоли вы увидите:

```
=== Dynatrace Metrics Status ===
Status: { enabled: true, dtrumAvailable: false, mode: 'fallback' }
Ready: true
================================

[dynatrace-root] ℹ️ DtrumWrapper initialized { debugMode: true, appName: 'dynatrace-root', dtrumAvailable: false }

[⚠ FALLBACK] [dynatrace-root] PAGE_START
⏰ 2024-01-15T10:30:45.456Z
📝 Page started (fallback mode): dynatrace-root:RootApp
📊 Data: { pageName: 'dynatrace-root:RootApp', timestamp: 1705315845456 }

[⚠ FALLBACK] [dynatrace-root] CUSTOM_EVENT
⏰ 2024-01-15T10:30:45.789Z
📝 Custom event (fallback mode): dynatrace-root:app-mounted
📊 Data: { properties: { timestamp: 1705315845789, userAgent: '...' } }
```

**Префикс `⚠ FALLBACK`** означает что Dynatrace не подключен и метрики работают в fallback режиме (только логирование в консоль).

## Использование метрик в других микрофронтендах

### В tasks приложении

```typescript
// apps/tasks/src/pages/TasksList.tsx
import { metrics } from '@farzoom/metrics-front-lib';

export const TasksList: React.FC = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const loadTasks = async () => {
      // Начать действие
      metrics.startAction('LOAD_TASKS', 'xhr');

      try {
        const response = await fetch('/api/tasks');
        const data = await response.json();
        setTasks(data);

        // Завершить действие
        metrics.leaveAction('LOAD_TASKS');
      } catch (error) {
        // Отследить ошибку
        metrics.reportError(error, 'LOAD_TASKS');
        metrics.leaveAction('LOAD_TASKS');
      }
    };

    loadTasks();
  }, []);

  return <div>Tasks: {tasks.length}</div>;
};
```

### В layout приложении

```typescript
// apps/layout/src/components/Sidebar.tsx
import { metrics } from '@farzoom/metrics-front-lib';

export const Sidebar: React.FC = () => {
  const handleNavigation = (path: string) => {
    // Отследить клик по пункту меню через действие
    metrics.startAction('MENU_CLICK');
    metrics.leaveAction('MENU_CLICK');
  };

  return (
    <Menu>
      <Menu.Item onClick={() => handleNavigation('/tasks')}>
        Tasks
      </Menu.Item>
      <Menu.Item onClick={() => handleNavigation('/order')}>
        Orders
      </Menu.Item>
    </Menu>
  );
};
```

### В order приложении

```typescript
// apps/order/src/pages/OrderDetails.tsx
import { useEffect } from 'react';
import { metrics } from '@farzoom/metrics-front-lib';

export const OrderDetails: React.FC<{ orderId: string }> = ({ orderId }) => {
  useEffect(() => {
    // Отследить просмотр заказа через действие
    metrics.startAction('ORDER_VIEW');

    return () => {
      metrics.leaveAction('ORDER_VIEW');
    };
  }, [orderId]);

  return <div>Order {orderId}</div>;
};
```

## Что вы увидите в консоли

### При навигации между страницами

```
[⚠ FALLBACK] [dynatrace-root] CUSTOM_EVENT
⏰ 2024-01-15T10:31:23.456Z
📝 Custom event (fallback mode): dynatrace-root:menu-item-click
📊 Data: { properties: { path: '/tasks' } }
```

### При загрузке данных

```
[⚠ FALLBACK] [dynatrace-root] ACTION_START
⏰ 2024-01-15T10:31:45.123Z
📝 Action started (fallback mode): dynatrace-root:LOAD_TASKS
📊 Data: { actionId: 1, actionType: 'xhr', startTime: 1705315905123 }

[⚠ FALLBACK] [dynatrace-root] ACTION_END
⏰ 2024-01-15T10:31:47.456Z
📝 Action completed (fallback mode)
📊 Data: { actionId: 1, stopTime: 1705315907456 }
```

### При ошибках

```
[⚠ FALLBACK] [dynatrace-root] ERROR
⏰ 2024-01-15T10:32:15.789Z
📝 Error (fallback mode): [dynatrace-root] Failed to load tasks
📊 Data: {
  parentActionId: 1,
  source: 'TasksList',
  stackTrace: 'Error: Failed to load tasks\n  at ...',
  properties: { actionName: 'LOAD_TASKS' }
}
```

## Подключение Dynatrace

Когда вы подключите Dynatrace, префикс изменится на `✓ DYNATRACE` и события будут отправляться в Dynatrace:

### 1. Добавьте скрипт Dynatrace в HTML

```html
<!-- apps/root/public/index.html -->
<head>
  <script src="https://your-dynatrace-url/agent.js"></script>
</head>
```

### 2. Перезапустите приложение

После перезапуска в консоли вы увидите:

```
=== Dynatrace Metrics Status ===
Status: { enabled: true, dtrumAvailable: true, mode: 'dynatrace' }
Ready: true
================================

[dynatrace-root] ℹ️ DtrumWrapper initialized { debugMode: true, appName: 'dynatrace-root', dtrumAvailable: true }

[✓ DYNATRACE] [dynatrace-root] PAGE_START
⏰ 2024-01-15T10:30:45.456Z
📝 Page started: dynatrace-root:RootApp
📊 Data: { pageName: 'dynatrace-root:RootApp', actionId: 42 }
```

**Префикс `✓ DYNATRACE`** означает что события отправляются в Dynatrace.

## Отключение debug режима

Для production отключите debug режим:

```typescript
MetricsManager.initialize({
  appName: 'dynatrace-root',
  environment: 'prod',
  debugMode: false,  // Отключить логи в консоли
  enabled: true,
});
```

## Полезные команды

### Проверить статус метрик в runtime

Откройте консоль браузера и выполните:

```javascript
// Получить экземпляр менеджера
const manager = window.__DYNATRACE_METRICS__;

// Проверить статус
console.log(manager.getStatus());
// { enabled: true, dtrumAvailable: false, mode: 'fallback' }

// Проверить активные действия
console.log(manager.getActiveActions());
// ['LOAD_TASKS', 'LOAD_USERS']
```

### Включить/выключить метрики

```javascript
// Отключить
window.__DYNATRACE_METRICS__.setEnabled(false);

// Включить
window.__DYNATRACE_METRICS__.setEnabled(true);
```

## Дополнительная документация

- **README.md** - полная документация по API
- **DEBUG_MODE.md** - подробное руководство по debug режиму
- **EXAMPLES.md** - примеры использования
- **API_CORRECTIONS.md** - особенности Dynatrace API

## Решение проблем

### Метрики не работают

1. Проверьте что пакет установлен:
   ```bash
   npm list @farzoom/metrics
   ```

2. Проверьте инициализацию:
   ```javascript
   console.log(window.__DYNATRACE_METRICS__);
   // Должен вернуть объект MetricsManager
   ```

3. Проверьте статус:
   ```javascript
   console.log(window.__DYNATRACE_METRICS__.getStatus());
   ```

### Не вижу логов в консоли

Убедитесь что `debugMode: true` при инициализации:

```typescript
MetricsManager.initialize({
  debugMode: true,  // ← должно быть true
  // ...
});
```

### TypeScript ошибки

Пересоберите пакет metrics:

```bash
cd packages/metrics
npm run build
```
