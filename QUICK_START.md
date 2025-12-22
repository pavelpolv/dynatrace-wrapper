# Быстрый старт: Метрики с ленивой загрузкой

## 🚀 Что реализовано

Создана система метрик, которая отслеживает загрузку микрофронтендов **ДО начала загрузки JS файлов**.

### Ключевые особенности

✅ Метрика `LOAD_TASKS` отправляется до загрузки tasks модуля
✅ Метрика `LOAD_ORDERS` отправляется до загрузки order модуля
✅ Работает без Dynatrace (fallback режим с логами в консоль)
✅ Debug режим с красивыми логами: 🚀 ✅ ❌
✅ Автоматическое отслеживание ошибок загрузки

## 📁 Что создано

```
packages/metrics/              # Пакет метрик
  ├── src/                     # Исходники
  └── README.md                # Документация API

apps/root/src/components/      # Компоненты для ленивой загрузки
  ├── LazyLoadWithMetrics.tsx  # Базовый компонент
  ├── LazyTasksRoutes.tsx      # Tasks с метриками
  └── LazyOrderRoutes.tsx      # Orders с метриками

Документация:
  ├── SUMMARY_METRICS.md       # Полная документация
  ├── METRICS_USAGE.md         # Инструкция по использованию
  └── QUICK_START.md           # Этот файл
```

## 🏃 Запуск

```bash
# Из корня проекта
npm run dev
```

Откройте браузер: http://localhost:3000

## 👀 Что вы увидите в консоли

### При старте приложения

```
=== Dynatrace Metrics Status ===
Status: { enabled: true, dtrumAvailable: false, mode: 'fallback' }
Ready: true
================================

[dynatrace-root] ℹ️ DtrumWrapper initialized
```

### При навигации на /tasks

```
🚀 Starting lazy load for action: LOAD_TASKS

[⚠ FALLBACK] [dynatrace-root] ACTION_START
⏰ 2024-01-15T10:30:45.123Z
📝 Action started (fallback mode): dynatrace-root:LOAD_TASKS
📊 Data: { actionId: 1, actionType: 'load' }

✅ Lazy load completed for action: LOAD_TASKS

[⚠ FALLBACK] [dynatrace-root] ACTION_END
⏰ 2024-01-15T10:30:46.789Z
📝 Action completed (fallback mode)
📊 Data: { actionId: 1 }
```

**Время загрузки:** 1.666 секунды (46.789 - 45.123)

### При навигации на /order

```
🚀 Starting lazy load for action: LOAD_ORDERS

[⚠ FALLBACK] [dynatrace-root] ACTION_START
📝 Action started (fallback mode): dynatrace-root:LOAD_ORDERS

✅ Lazy load completed for action: LOAD_ORDERS

[⚠ FALLBACK] [dynatrace-root] ACTION_END
📝 Action completed (fallback mode)
```

## 🔍 Префиксы в логах

- **⚠ FALLBACK** - работает без Dynatrace (режим fallback)
- **✓ DYNATRACE** - Dynatrace подключен, метрики отправляются
- **🚀** - начало загрузки модуля
- **✅** - успешная загрузка модуля
- **❌** - ошибка загрузки модуля

## 💻 Проверка в runtime

Откройте консоль браузера и выполните:

```javascript
// Получить менеджер метрик
const manager = window.__DYNATRACE_METRICS__;

// Проверить статус
manager.getStatus();
// { enabled: true, dtrumAvailable: false, mode: 'fallback' }

// Активные действия
manager.getActiveActions();
// ['LOAD_TASKS']

// Отключить метрики
manager.setEnabled(false);

// Включить обратно
manager.setEnabled(true);
```

## 📊 Как это работает

### 1. Инициализация (bootstrap.tsx)

```typescript
MetricsManager.initialize({
  appName: 'dynatrace-root',
  debugMode: true,  // Включен debug режим
  enabled: true,
});
```

### 2. Использование компонентов

```typescript
<Route path="/tasks">
  <LazyTasksRoutes />  {/* Метрика LOAD_TASKS */}
</Route>

<Route path="/order">
  <LazyOrderRoutes />  {/* Метрика LOAD_ORDERS */}
</Route>
```

### 3. Timeline событий

```
Клик на "Tasks"
    ↓
Router → /tasks
    ↓
<LazyTasksRoutes /> рендерится
    ↓
🚀 metrics.startAction('LOAD_TASKS') - МЕТРИКА ОТПРАВЛЕНА!
    ↓
import('tasks/Routes') - загрузка chunk
    ↓
Webpack загружает файл
    ↓
✅ metrics.leaveAction('LOAD_TASKS') - ЗАВЕРШЕНО
    ↓
<TasksRoutes /> на экране
```

## 🎯 Добавление метрик в код

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

export const MyComponent = () => {
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

## 🔧 Подключение Dynatrace

Когда подключите Dynatrace, префикс изменится на `✓ DYNATRACE`:

```html
<!-- apps/root/public/index.html -->
<head>
  <script src="https://your-dynatrace-url/agent.js"></script>
</head>
```

После этого:
- Метрики будут отправляться в Dynatrace
- В консоли префикс изменится на `✓ DYNATRACE`
- Используются реальные actionId от dtrum

## 📚 Документация

### Основные файлы

1. **SUMMARY_METRICS.md** - полная документация всей системы
2. **METRICS_USAGE.md** - инструкция по использованию
3. **packages/metrics/README.md** - документация API пакета
4. **packages/metrics/DEBUG_MODE.md** - руководство по debug режиму
5. **apps/root/LAZY_LOAD_METRICS.md** - документация по ленивой загрузке

### Быстрые ссылки

- API пакета → `packages/metrics/README.md`
- Debug режим → `packages/metrics/DEBUG_MODE.md`
- Примеры → `packages/metrics/EXAMPLES.md`

## ❓ Решение проблем

### Не вижу логов в консоли

Проверьте что `debugMode: true` при инициализации:

```typescript
MetricsManager.initialize({
  debugMode: true,  // ← должно быть true
});
```

### Метрики не работают

```javascript
// Проверить инициализацию
console.log(window.__DYNATRACE_METRICS__);

// Проверить статус
console.log(window.__DYNATRACE_METRICS__.getStatus());
```

### Действия не завершаются

```javascript
// Посмотреть активные действия
console.log(window.__DYNATRACE_METRICS__.getActiveActions());
```

## 🎓 Следующие шаги

### 1. Изучите логи

Откройте консоль браузера и понаблюдайте за метриками при навигации между страницами.

### 2. Добавьте свои метрики

Используйте `metrics.startAction()` и `metrics.leaveAction()` для отслеживания действий пользователя.

### 3. Создайте новый модуль

Скопируйте `LazyTasksRoutes.tsx` и измените `actionName`.

### 4. Подключите Dynatrace

Добавьте скрипт Dynatrace в HTML и посмотрите на изменение префикса.

## ✨ Преимущества

1. **Точные метрики** - измеряется реальное время загрузки модуля
2. **Работает всегда** - fallback режим без Dynatrace
3. **Debug режим** - красивые логи для отладки
4. **Автоматизация** - не нужно вручную добавлять метрики
5. **Типобезопасность** - TypeScript с автодополнением

## 🚀 Готово!

Теперь у вас есть полнофункциональная система метрик с отслеживанием ленивой загрузки модулей.

Приятной работы! 🎉
