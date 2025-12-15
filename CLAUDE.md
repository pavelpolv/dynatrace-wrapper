# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Обзор проекта

Это Turborepo монорепозиторий с микрофронтенд архитектурой на основе Webpack Module Federation.
Проект состоит из 4 React приложений, взаимодействующих через Module Federation.

## Структура проекта

```
apps/
  root/         - Главное приложение (host), порт 3000
  layout/       - Микрофронтенд с навигацией (Header + Sidebar), порт 3001
  tasks/        - Микрофронтенд для управления задачами, порт 3002
  order/        - Микрофронтенд для управления заказами, порт 3003
packages/
  shared/       - Общие типы, API клиент, константы
```

## Основные команды

### Разработка
```bash
# Запуск всех приложений одновременно (рекомендуется)
npm run dev

# Запуск конкретного приложения
npx turbo dev --filter=root
npx turbo dev --filter=layout
npx turbo dev --filter=tasks
npx turbo dev --filter=order
```

**ВАЖНО**: Для работы Module Federation все remote приложения (layout, tasks, order) должны быть запущены перед запуском root приложения.

### Сборка
```bash
# Сборка всех приложений
npm run build

# Сборка конкретного приложения
npx turbo build --filter=root
```

### Очистка
```bash
# Очистка dist папок во всех приложениях
npm run clean
```

### Линтинг
```bash
# Линтинг всех пакетов
npm run lint
```

## Технологический стек

- **Монорепозиторий**: Turborepo с npm workspaces
- **Module Federation**: Webpack 5 Module Federation Plugin
- **React**: 17.0.2
- **React Router**: 5.3.3
- **UI библиотека**: Ant Design 4.24.15
- **HTTP клиент**: Axios 1.6.0
- **Язык**: TypeScript 5.3.3
- **Сборщик**: Webpack 5.89.0

## Архитектура Module Federation

### Host приложение (root)
- Порт: 3000
- Роль: Главное приложение, которое загружает и интегрирует все remote модули
- **Стартовая страница**: При переходе на `/` автоматически редиректит на `/tasks`
- Импортирует:
  - `layout/Header` - компонент шапки
  - `layout/Sidebar` - компонент левого меню
  - `tasks/Routes` - роуты для задач
  - `order/Routes` - роуты для заказов

### Remote приложения

#### layout (порт 3001)
- Экспортирует: `Header`, `Sidebar`
- Компоненты навигации с Ant Design
- Sidebar с роутингом на Tasks и Orders

#### tasks (порт 3002)
- Экспортирует: `TasksRoutes`
- Роуты:
  - `/tasks` - список задач (Table)
  - `/tasks/:id` - детальная страница задачи
- API: JSONPlaceholder `/todos`

#### order (порт 3003)
- Экспортирует: `OrderRoutes`
- Роуты:
  - `/order` - список заказов (Table)
  - `/order/:id` - детальная страница заказа
- API: JSONPlaceholder `/users`

## Shared пакет (@repo/shared)

Содержит общий код для всех приложений:

### API клиент (src/api.ts)
- Настроенный axios instance с baseURL на JSONPlaceholder
- Interceptors для обработки ошибок

### Типы (src/types.ts)
- `Task` - интерфейс задачи
- `Order` - интерфейс заказа (расширяет User)
- `User` - интерфейс пользователя

### Константы (src/constants.ts)
- `ROUTES` - маршруты приложения
- `APP_PORTS` - порты всех приложений

## Особенности работы

### Module Federation
- Все remote приложения должны быть запущены ДО запуска host приложения
- Shared зависимости (react, react-dom, react-router-dom, antd) используют singleton режим
- Динамический импорт с React.Suspense для ленивой загрузки модулей

### Роутинг
- React Router v5 используется во всех приложениях
- Централизованная навигация через Sidebar в layout приложении
- BrowserRouter в root приложении координирует роутинг всех микрофронтендов

### API интеграция
- Используется публичное API: https://jsonplaceholder.typicode.com
- Tasks работают с `/todos` endpoint
- Orders работают с `/users` endpoint
- Обработка loading и error состояний через Ant Design компоненты

## Порты приложений

- `root`: 3000 (host)
- `layout`: 3001 (remote)
- `tasks`: 3002 (remote)
- `order`: 3003 (remote)

## Решение проблем с TypeScript

Проект использует React 17 с TypeScript 5.3, что требует специальной настройки:

### Настройки для совместимости
1. **npm overrides** в корневом `package.json`:
   ```json
   "overrides": {
     "@types/react": "17.0.62",
     "@types/react-dom": "17.0.20"
   }
   ```
   Это фиксирует версии типов и предотвращает конфликты.

2. **tsconfig.json** во всех приложениях:
   - `"strict": false` - отключает строгий режим для совместимости
   - `"skipLibCheck": true` - пропускает проверку типов в библиотеках

3. **webpack.config.js** - ts-loader с `transpileOnly`:
   ```javascript
   {
     test: /\.(ts|tsx)$/,
     use: {
       loader: 'ts-loader',
       options: {
         transpileOnly: true,  // Отключает проверку типов при сборке
       },
     },
   }
   ```

### Важно
- После изменения `package.json` нужно удалить `node_modules` и `package-lock.json`, затем выполнить `npm install`
- `transpileOnly: true` позволяет webpack собирать код без проверки типов, что ускоряет разработку

## Отладка

Если приложение не загружается:
1. Проверьте, что все remote приложения запущены и доступны
2. Проверьте консоль браузера на ошибки Module Federation
3. Убедитесь, что порты не заняты другими процессами
4. Проверьте, что webpack dev server работает для всех приложений