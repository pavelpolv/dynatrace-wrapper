# Метод identifyUser

Метод `identifyUser` предназначен для идентификации пользователей в Dynatrace. Он устанавливает тег пользователя, который позволяет отслеживать активность одного пользователя в разных браузерах, устройствах и сессиях.

## Официальная документация

[Dynatrace API - identifyUser](https://www.dynatrace.com/support/doc/javascriptapi/doc/types/dtrum.html#identifyuser)

## Сигнатура

```typescript
identifyUser(value: string): void
```

### Параметры

- **value** (string) - Идентификатор пользователя (имя, ID, email и т.д.)

## Способы использования

### 1. Через объект metrics (рекомендуется)

```typescript
import { metrics } from '@repo/metrics';

// С ID пользователя
metrics.identifyUser("user123");

// С email
metrics.identifyUser("user@example.com");

// С custom ID
metrics.identifyUser("john_doe");
```

### 2. Через утилитную функцию

```typescript
import { identifyUser } from '@repo/metrics';

// После авторизации пользователя
function onUserLogin(user) {
  identifyUser(user.id);
}

// В компоненте
function UserProfile({ userId }) {
  useEffect(() => {
    identifyUser(userId);
  }, [userId]);
}
```

## Примеры использования

### Идентификация при авторизации

```typescript
import { metrics } from '@repo/metrics';

async function handleLogin(email: string, password: string) {
  try {
    const user = await loginAPI(email, password);

    // Идентифицируем пользователя в Dynatrace
    metrics.identifyUser(user.id);

    return user;
  } catch (error) {
    metrics.reportError(error, 'LOGIN_FAILED');
    throw error;
  }
}
```

### Использование в React приложении

```typescript
import React, { useEffect } from 'react';
import { metrics } from '@repo/metrics';

function App() {
  const user = useAuth(); // Ваш хук авторизации

  useEffect(() => {
    if (user) {
      // Идентифицируем пользователя при загрузке приложения
      metrics.identifyUser(user.id);
    }
  }, [user]);

  return <div>...</div>;
}
```

### Идентификация в микрофронтенде

```typescript
import { metrics } from '@repo/metrics';

// В root приложении при инициализации
function initializeApp() {
  // Проверяем, есть ли сохраненный пользователь
  const savedUser = localStorage.getItem('userId');

  if (savedUser) {
    metrics.identifyUser(savedUser);
  }
}

// В remote приложении
function RemoteApp() {
  const { userId } = useUserContext();

  useEffect(() => {
    if (userId) {
      metrics.identifyUser(userId);
    }
  }, [userId]);

  return <div>...</div>;
}
```

### Идентификация при переключении пользователей

```typescript
import { metrics } from '@repo/metrics';

function switchUser(newUserId: string) {
  // Меняем пользователя
  metrics.identifyUser(newUserId);

  // Начинаем отслеживать новую сессию через действие
  metrics.startAction('USER_SWITCH');
  metrics.leaveAction('USER_SWITCH');
}
```

## Важные замечания

1. **Вызывайте после авторизации**: Метод нужно вызывать после того, как пользователь авторизовался
2. **Один раз за сессию**: Обычно достаточно вызвать один раз при инициализации приложения
3. **Работает без Dynatrace**: Пакет работает в fallback режиме, если Dynatrace недоступен
4. **Отслеживание между устройствами**: Dynatrace будет связывать активность с одним пользователем на всех устройствах

## Отладка

В debug режиме можно увидеть логи идентификации пользователя:

```typescript
// В root приложении при инициализации
MetricsManager.initialize({
  appName: 'my-app',
  debugMode: true, // Включить отладку
});

// При вызове identifyUser увидите в консоли:
// [✓ DYNATRACE] [my-app] USER_IDENTIFIED
// ⏰ 2024-01-15T10:30:00.000Z
// 📝 User identified: user123
// 📊 Data: { userId: "user123" }
```

## TypeScript типы

```typescript
interface Metrics {
  identifyUser(value: string): void;
}

// Утилитная функция
declare function identifyUser(value: string): void;
```
