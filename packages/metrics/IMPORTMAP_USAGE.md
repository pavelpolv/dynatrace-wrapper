# Использование @farzoom/metrics через Import Map

Пакет `@farzoom/metrics` теперь собирается как ESM модуль и готов к использованию через import-map для CDN.

## Что изменилось

### ✅ Исправлены проблемы

1. **Решена ошибка TS1205**: Все реэкспорты типов теперь используют `export type` для совместимости с `isolatedModules`
2. **ESM сборка**: Используется esbuild для создания оптимизированного ESM бандла
3. **TypeScript типы**: Генерируются declaration файлы (`.d.ts`) для полной поддержки TypeScript
4. **Source maps**: Включены source maps для отладки

### 📦 Структура сборки

```
dist/
├── index.js           # ESM бандл (23.3kb)
├── index.js.map       # Source map для JS
├── index.d.ts         # TypeScript типы (главный файл)
├── *.d.ts             # Остальные типы
└── *.d.ts.map         # Source maps для типов
```

## Настройка package.json

Пакет теперь правильно настроен для публикации в npm:

```json
{
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "default": "./dist/index.js"
    }
  },
  "sideEffects": false,
  "files": ["dist"]
}
```

## Использование через Import Map

### 1. Публикация в npm

Сначала опубликуйте пакет в npm:

```bash
cd packages/metrics

# Убедитесь, что пакет не приватный
# В package.json измените "private": true на "private": false

# Войдите в npm
npm login

# Опубликуйте пакет
npm publish --access public
```

### 2. Подключение через Import Map

После публикации в npm можете использовать пакет через CDN (unpkg, jsDelivr, esm.sh):

#### Вариант A: unpkg

```html
<!DOCTYPE html>
<html>
<head>
  <script type="importmap">
    {
      "imports": {
        "@farzoom/metrics-front-lib": "https://unpkg.com/@farzoom/metrics@0.3.0/dist/index.js",
        "react": "https://esm.sh/react@17.0.2"
      }
    }
  </script>
</head>
<body>
  <script type="module">
    import { metrics, MetricsManager } from '@farzoom/metrics-front-lib';

    // Инициализация
    MetricsManager.initialize({
      appName: 'my-app',
      environment: 'production',
      debugMode: false
    });

    // Использование
    metrics.startAction('PAGE_LOAD');
    metrics.leaveAction('PAGE_LOAD');
  </script>
</body>
</html>
```

#### Вариант B: esm.sh (рекомендуется)

```html
<script type="importmap">
  {
    "imports": {
      "@farzoom/metrics-front-lib": "https://esm.sh/@farzoom/metrics@0.3.0",
      "react": "https://esm.sh/react@17.0.2"
    }
  }
</script>
```

#### Вариант C: jsDelivr

```html
<script type="importmap">
  {
    "imports": {
      "@farzoom/metrics-front-lib": "https://cdn.jsdelivr.net/npm/@farzoom/metrics@0.3.0/dist/index.js",
      "react": "https://esm.sh/react@17.0.2"
    }
  }
</script>
```

### 3. Использование в микрофронтендах

```javascript
// В любом микрофронтенде
import { metrics } from '@farzoom/metrics-front-lib';

// Метрики уже инициализированы в root приложении
metrics.startAction('LOAD_TASKS');

try {
  const tasks = await loadTasks();
  metrics.addActionProperties('LOAD_TASKS', {
    shortString: { status: 'success' },
    javaLong: { count: tasks.length }
  });
  metrics.leaveAction('LOAD_TASKS');
} catch (error) {
  metrics.reportError(error, 'LOAD_TASKS');
}
```

## TypeScript поддержка

Типы автоматически доступны при использовании пакета из npm:

```typescript
import { metrics, MetricsManager, MetricsManagerConfig } from '@farzoom/metrics-front-lib';
import type { UserAction, PageLoadMetrics } from '@farzoom/metrics-front-lib';

// Полная поддержка типов
const config: MetricsManagerConfig = {
  appName: 'my-app',
  environment: 'production',
  debugMode: false
};

MetricsManager.initialize(config);
```

## Сборка и разработка

### Команды

```bash
# Сборка (ESM + типы)
npm run build

# Проверка типов
npm run typecheck

# Разработка (watch mode)
npm run dev

# Очистка
npm run clean
```

### Структура сборки (build.mjs)

Сборка выполняется через `build.mjs`:

1. Очистка директории `dist`
2. Сборка ESM бандла через esbuild
3. Генерация TypeScript типов через tsc

## Характеристики

- **Размер бандла**: ~23.3 KB (несжатый)
- **Формат**: ESM (ES2020)
- **Tree-shaking**: Включен (`sideEffects: false`)
- **Source maps**: Включены для JS и типов
- **Peer dependencies**: React ^17.0.2

## Преимущества ESM сборки

1. ✅ Совместимость с import-map
2. ✅ Tree-shaking для оптимизации размера
3. ✅ Нативная поддержка браузерами
4. ✅ Быстрая загрузка через CDN
5. ✅ Полная поддержка TypeScript типов
6. ✅ Source maps для отладки
