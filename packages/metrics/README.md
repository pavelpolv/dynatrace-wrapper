# @repo/metrics

> Типобезопасная обёртка над Dynatrace RUM API для микрофронтенд архитектуры

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![ESM](https://img.shields.io/badge/ESM-Ready-brightgreen.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)

## ✨ Возможности

- 🎯 **Типобезопасность** - Полная поддержка TypeScript с строгой типизацией
- 🔌 **ESM формат** - Готов к использованию через import-map и CDN
- 🎭 **Singleton паттерн** - Единый экземпляр метрик для всех микрофронтендов
- 🔍 **Debug режим** - Детальное логирование для разработки
- 🌐 **Глобальный доступ** - Доступен через \`window.__DYNATRACE_METRICS__\`
- 🎨 **Fallback режим** - Работает даже без Dynatrace RUM

## 📦 Установка

### Через npm

\`\`\`bash
npm install @repo/metrics
\`\`\`

### Через Import Map

\`\`\`html
<script type="importmap">
  {
    "imports": {
      "@repo/metrics": "https://esm.sh/@repo/metrics@0.3.0"
    }
  }
</script>
\`\`\`

## 🚀 Быстрый старт

### 1. Инициализация (в root приложении)

\`\`\`typescript
import { MetricsManager } from '@repo/metrics';

MetricsManager.initialize({
  appName: 'my-app',
  environment: 'production',
  debugMode: false
});
\`\`\`

### 2. Использование в любом микрофронтенде

\`\`\`typescript
import { metrics } from '@repo/metrics';

metrics.startAction('LOAD_TASKS');

try {
  const tasks = await fetchTasks();
  metrics.addActionProperties('LOAD_TASKS', {
    shortString: { status: 'success' },
    javaLong: { count: tasks.length }
  });
  metrics.leaveAction('LOAD_TASKS');
} catch (error) {
  metrics.reportError(error, 'LOAD_TASKS');
  throw error;
}
\`\`\`

## 📚 API

### metrics (рекомендуемый)

\`\`\`typescript
metrics.startAction(name: string): number
metrics.leaveAction(name: string): void
metrics.addActionProperties(name, properties): void
metrics.reportError(error, actionName?): void
metrics.identifyUser(userId: string): void
metrics.getActiveActions(): string[]
metrics.getStatus(): object | null
\`\`\`

### MetricsManager

\`\`\`typescript
MetricsManager.initialize(config): void
MetricsManager.getInstance(): MetricsManager | null
\`\`\`

## 🔧 Разработка

\`\`\`bash
npm run build       # Сборка ESM + типы
npm run typecheck   # Проверка типов
npm run clean       # Очистка dist
\`\`\`

## 📖 Документация

- [IMPORTMAP_USAGE.md](./IMPORTMAP_USAGE.md) - Использование через Import Map
- [PUBLISH.md](./PUBLISH.md) - Публикация в npm
- [IDENTIFY_USER.md](./IDENTIFY_USER.md) - Идентификация пользователей

## 📄 License

MIT
