# E2E тесты для микрофронтенд приложения

Этот пакет содержит E2E (end-to-end) тесты для всех модулей приложения на базе Playwright.

## Структура

```
packages/e2e/
├── tests/
│   ├── tasks.spec.ts    # Тесты для модуля Tasks
│   └── orders.spec.ts   # Тесты для модуля Orders
├── playwright.config.ts # Конфигурация Playwright
├── package.json
└── tsconfig.json
```

## Запуск тестов

### Из корня проекта

```bash
# Запуск всех E2E тестов (headless режим)
npm run test:e2e

# Запуск с видимым браузером
npm run test:e2e:headed

# Запуск в UI режиме (интерактивный)
npm run test:e2e:ui

# Запуск в режиме отладки
npm run test:e2e:debug

# Просмотр отчета о последнем запуске
npm run test:e2e:report
```

### Из пакета e2e

```bash
cd packages/e2e

# Запуск всех тестов
npm test

# Запуск с видимым браузером
npm run test:headed

# Запуск в UI режиме
npm run test:ui

# Запуск в режиме отладки
npm run test:debug

# Просмотр отчета
npm run report

# Генерация тестов (запись действий в браузере)
npm run codegen
```

## Автоматический запуск dev сервера

Playwright автоматически запустит все приложения перед тестами:
- Команда: `npm run dev` (запускает все микрофронтенды)
- Ожидание: http://localhost:3000 (root app)
- Таймаут: 120 секунд

Если приложения уже запущены, Playwright переиспользует существующие серверы.

## Что тестируется

### Tasks Module (`tests/tasks.spec.ts`)
- ✅ Отображение страницы и заголовка
- ✅ Обработка ошибок API
- ✅ Состояние загрузки
- ✅ Навигация между страницами
- ✅ Интеграция Module Federation
- 🔄 Таблица с данными (пропущено из-за ошибки в API endpoint)

**ВАЖНО**: В коде Tasks есть ошибка - запрос идет на `/todos1` вместо `/todos`.
После исправления на правильный endpoint `/todos`, нужно убрать `.skip()` у помеченных тестов.

### Orders Module (`tests/orders.spec.ts`)
- ✅ Отображение страницы и заголовка
- ✅ Загрузка таблицы с заказами
- ✅ Правильные колонки таблицы
- ✅ Навигация к деталям заказа
- ✅ Пагинация
- ✅ Обработка ошибок
- ✅ Валидация данных
- ✅ Интеграция Module Federation

## Результаты тестов

После запуска тестов создаются следующие артефакты:

1. **test-results/** - скриншоты, видео и trace при ошибках
2. **playwright-report/** - HTML отчет с детальной информацией
3. **test-results/results.json** - JSON с результатами

## Просмотр результатов

```bash
# Открыть HTML отчет
npm run test:e2e:report

# Просмотр trace (для отладки упавших тестов)
npx playwright show-trace test-results/*/trace.zip
```

## Отладка

### Визуальная отладка
```bash
# Запуск с UI Inspector
npm run test:e2e:ui

# Запуск в debug режиме
npm run test:e2e:debug
```

### Генерация новых тестов
Playwright может записать ваши действия и сгенерировать тест:

```bash
cd packages/e2e
npm run codegen
```

Откроется браузер и окно Playwright Inspector. Выполните действия в браузере, и код теста будет автоматически сгенерирован.

## CI/CD

Тесты настроены для работы в CI окружении:
- Retry: 2 попытки при падении
- Workers: 1 (последовательное выполнение)
- Headless: включен автоматически в CI

Проверка CI через переменную окружения `CI=true`:
```bash
CI=true npm run test:e2e
```

## Известные проблемы

1. **Tasks API Error**: В `apps/tasks/src/pages/TasksList.tsx:21` ошибочный endpoint `/todos1`.
   Нужно исправить на `/todos`. После исправления убрать `.skip()` у помеченных тестов.

2. **Module Federation**: Все remote приложения (layout, tasks, order) должны быть запущены перед root приложением.
   Конфигурация `webServer` в playwright.config.ts автоматически запускает все приложения.

## Расширение тестов

Для добавления новых тестов:

1. Создайте файл `tests/your-module.spec.ts`
2. Используйте структуру:
```typescript
import { test, expect } from '@playwright/test';

test.describe('Your Module', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/your-path');
    // ваши проверки
  });
});
```

3. Запустите тесты для проверки

## Документация

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
