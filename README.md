# Module Federation Demo with Turborepo

Демонстрационное приложение, реализующее микрофронтенд архитектуру с помощью Webpack 5 Module Federation в монорепозитории Turborepo.

## Описание проекта

Проект состоит из 4 независимых React приложений:

- **root** (host) - главное приложение, координирующее все микрофронтенды
- **layout** (remote) - компоненты навигации (Header + Sidebar)
- **tasks** (remote) - управление задачами
- **order** (remote) - управление заказами

## Технологический стек

- **React** 17.0.2
- **React Router** 5.3.3
- **Ant Design** 4.24.15
- **Webpack** 5.89.0 + Module Federation
- **TypeScript** 5.3.3
- **Axios** 1.6.0
- **Turborepo** 2.6.3

## Быстрый старт

### Установка зависимостей

```bash
npm install
```

### Запуск в режиме разработки

Запустите все приложения одной командой:

```bash
npm run dev
```

Это запустит все 4 приложения параллельно:
- http://localhost:3000 - root (главное приложение)
- http://localhost:3001 - layout (навигация)
- http://localhost:3002 - tasks (задачи)
- http://localhost:3003 - order (заказы)

**Важно:** Откройте http://localhost:3000 в браузере после того, как все приложения запустятся.

### Сборка

```bash
npm run build
```

## Структура проекта

```
.
├── apps/
│   ├── root/          # Host приложение (Module Federation)
│   │   ├── src/
│   │   │   ├── bootstrap.tsx   # Главный компонент App
│   │   │   ├── index.ts        # Точка входа с динамическим импортом
│   │   │   └── types/
│   │   │       └── remotes.d.ts # TypeScript типы для remote модулей
│   │   ├── webpack.config.js    # Конфигурация MF
│   │   └── package.json
│   │
│   ├── layout/        # Remote с навигацией
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Header.tsx   # Шапка приложения
│   │   │   │   └── Sidebar.tsx  # Левое меню с навигацией
│   │   │   └── index.ts
│   │   ├── webpack.config.js    # Экспортирует Header и Sidebar
│   │   └── package.json
│   │
│   ├── tasks/         # Remote с задачами
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   │   ├── TasksList.tsx    # Список задач
│   │   │   │   └── TaskDetail.tsx   # Детальная страница
│   │   │   ├── routes.tsx           # React Router routes
│   │   │   └── index.ts
│   │   ├── webpack.config.js        # Экспортирует TasksRoutes
│   │   └── package.json
│   │
│   └── order/         # Remote с заказами
│       ├── src/
│       │   ├── pages/
│       │   │   ├── OrderList.tsx    # Список заказов
│       │   │   └── OrderDetail.tsx  # Детальная страница
│       │   ├── routes.tsx           # React Router routes
│       │   └── index.ts
│       ├── webpack.config.js        # Экспортирует OrderRoutes
│       └── package.json
│
└── packages/
    └── shared/        # Общие утилиты
        ├── src/
        │   ├── types.ts      # TypeScript интерфейсы
        │   ├── api.ts        # Axios клиент
        │   ├── constants.ts  # Константы
        │   └── index.ts
        └── package.json
```

## Архитектура Module Federation

### Host приложение (root)

Загружает и интегрирует все remote модули:

```javascript
remotes: {
  layout: 'layout@http://localhost:3001/remoteEntry.js',
  tasks: 'tasks@http://localhost:3002/remoteEntry.js',
  order: 'order@http://localhost:3003/remoteEntry.js',
}
```

### Remote приложения

Каждое remote приложение экспортирует свои компоненты:

- **layout**: `./Header`, `./Sidebar`
- **tasks**: `./Routes`
- **order**: `./Routes`

### Shared зависимости

Все приложения используют общие singleton зависимости:
- react
- react-dom
- react-router-dom
- antd

## Функциональность

### Tasks (Задачи)

- **Список задач** (`/tasks`) - таблица со всеми задачами
- **Детали задачи** (`/tasks/:id`) - подробная информация о задаче
- Данные из JSONPlaceholder API: https://jsonplaceholder.typicode.com/todos

### Orders (Заказы)

- **Список заказов** (`/order`) - таблица со всеми заказами
- **Детали заказа** (`/order/:id`) - подробная информация о заказе
- Данные из JSONPlaceholder API: https://jsonplaceholder.typicode.com/users

### Layout (Навигация)

- **Header** - шапка приложения с логотипом
- **Sidebar** - левое меню с переходами:
  - Home
  - Tasks
  - Orders

## API

Приложение использует бесплатное публичное API [JSONPlaceholder](https://jsonplaceholder.typicode.com/):

- `/todos` - для задач
- `/users` - для заказов

## Команды разработки

```bash
# Запуск всех приложений
npm run dev

# Запуск конкретного приложения
npx turbo dev --filter=root
npx turbo dev --filter=layout
npx turbo dev --filter=tasks
npx turbo dev --filter=order

# Сборка всех приложений
npm run build

# Сборка конкретного приложения
npx turbo build --filter=root

# Линтинг
npm run lint

# Очистка dist папок
npm run clean
```

## Порты приложений

| Приложение | Порт | URL |
|-----------|------|-----|
| root (host) | 3000 | http://localhost:3000 |
| layout | 3001 | http://localhost:3001 |
| tasks | 3002 | http://localhost:3002 |
| order | 3003 | http://localhost:3003 |

## Отладка

Если приложение не работает:

1. Убедитесь, что все зависимости установлены: `npm install`
2. Проверьте, что все приложения запущены: `npm run dev`
3. Проверьте консоль браузера на ошибки Module Federation
4. Убедитесь, что порты 3000-3003 не заняты

## Особенности реализации

### Динамический импорт

Root приложение использует динамический импорт для корректной работы Module Federation:

```typescript
// src/index.ts
import('./bootstrap');
```

### React Suspense

Все remote модули загружаются с помощью `React.lazy()` и `Suspense` для асинхронной загрузки.

### TypeScript типы

Типы для remote модулей определены в `apps/root/src/types/remotes.d.ts`.

## Дополнительная информация

- [Webpack Module Federation](https://webpack.js.org/concepts/module-federation/)
- [Turborepo Documentation](https://turborepo.com/docs)
- [Ant Design Components](https://4x.ant.design/components/overview/)
- [React Router v5](https://v5.reactrouter.com/)
