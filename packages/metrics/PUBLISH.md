# Инструкция по публикации @repo/metrics в npm

## Подготовка к публикации

### 1. Обновите package.json

Измените поле `private` на `false`:

```json
{
  "name": "@repo/metrics",
  "version": "0.3.0",
  "private": false,  // ← Измените на false
  ...
}
```

### 2. Выберите имя пакета

Если имя `@repo/metrics` уже занято в npm, измените его на уникальное:

```json
{
  "name": "@ваша-организация/metrics",  // Или просто "dynatrace-metrics-sdk"
  ...
}
```

## Процесс публикации

### Шаг 1: Убедитесь, что сборка работает

```bash
cd packages/metrics
npm run clean
npm run build
npm run typecheck
```

Должно быть создано:
- `dist/index.js` - ESM бандл
- `dist/index.d.ts` - TypeScript типы
- Source maps

### Шаг 2: Войдите в npm

```bash
npm login
```

Введите:
- Username (имя пользователя npm)
- Password (пароль)
- Email (подтвердите email, если требуется)
- OTP (если включена двухфакторная аутентификация)

### Шаг 3: Проверьте содержимое пакета

Посмотрите, какие файлы будут опубликованы:

```bash
npm pack --dry-run
```

Должны быть включены только:
- `dist/` директория со всем содержимым
- `package.json`
- `README.md` (если есть)
- `IMPORTMAP_USAGE.md`
- `PUBLISH.md`

### Шаг 4: Опубликуйте пакет

Для scoped пакета (@организация/имя):

```bash
npm publish --access public
```

Для обычного пакета:

```bash
npm publish
```

### Шаг 5: Проверьте публикацию

Посетите страницу пакета на npm:
- https://www.npmjs.com/package/@ваша-организация/metrics

Проверьте:
- ✅ Версия правильная
- ✅ Размер пакета (~25-30 KB)
- ✅ Файлы в пакете (должна быть только dist директория)
- ✅ README отображается
- ✅ Типы доступны

## Обновление версии

### Семантическое версионирование

- **Patch** (0.3.0 → 0.3.1): Исправления багов
  ```bash
  npm version patch
  ```

- **Minor** (0.3.0 → 0.4.0): Новые фичи (обратно совместимые)
  ```bash
  npm version minor
  ```

- **Major** (0.3.0 → 1.0.0): Breaking changes
  ```bash
  npm version major
  ```

### Процесс обновления

```bash
# 1. Убедитесь, что все изменения закоммичены
git status

# 2. Обновите версию
npm version patch  # или minor/major

# 3. Соберите пакет
npm run build

# 4. Опубликуйте новую версию
npm publish --access public

# 5. Запушьте git теги
git push --follow-tags
```

## Использование после публикации

### Import Map

```html
<script type="importmap">
  {
    "imports": {
      "@repo/metrics": "https://esm.sh/@repo/metrics@0.3.0",
      "react": "https://esm.sh/react@17.0.2"
    }
  }
</script>
```

### npm install

```bash
npm install @repo/metrics
```

### ES Module import

```javascript
import { metrics, MetricsManager } from '@repo/metrics';

MetricsManager.initialize({
  appName: 'my-app',
  environment: 'production'
});

metrics.startAction('USER_ACTION');
```

## Troubleshooting

### Ошибка: "Package name too similar to existing package"

Выберите другое имя пакета:
```json
{
  "name": "@ваша-уникальная-организация/metrics"
}
```

### Ошибка: "You must verify your email"

1. Войдите на npmjs.com
2. Перейдите в настройки профиля
3. Подтвердите email

### Ошибка: "402 Payment Required"

Scoped пакеты (@организация/имя) по умолчанию приватные.
Используйте флаг `--access public`:
```bash
npm publish --access public
```

### Ошибка: "You do not have permission to publish"

Убедитесь, что:
1. Вы залогинены: `npm whoami`
2. Имя пакета не занято: https://www.npmjs.com/package/@repo/metrics
3. Вы владелец организации @repo (если используете scoped имя)

## Чеклист перед публикацией

- [ ] `"private": false` в package.json
- [ ] Уникальное имя пакета
- [ ] Версия обновлена
- [ ] Сборка работает (`npm run build`)
- [ ] Типы проверены (`npm run typecheck`)
- [ ] README.md создан/обновлен
- [ ] Залогинены в npm (`npm whoami`)
- [ ] Git изменения закоммичены

## Автоматизация через CI/CD

Для автоматической публикации через GitHub Actions создайте `.github/workflows/publish.yml`:

```yaml
name: Publish Package

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'

      - name: Install dependencies
        run: npm install
        working-directory: ./packages/metrics

      - name: Build
        run: npm run build
        working-directory: ./packages/metrics

      - name: Publish
        run: npm publish --access public
        working-directory: ./packages/metrics
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

Добавьте `NPM_TOKEN` в GitHub Secrets:
1. Создайте token на npmjs.com (Profile → Access Tokens)
2. Добавьте в GitHub: Settings → Secrets → Actions → New repository secret
