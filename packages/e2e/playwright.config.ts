import { defineConfig, devices } from '@playwright/test';

/**
 * Конфигурация Playwright для E2E тестирования микрофронтенд приложения
 * Документация: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Директория с тестами
  testDir: './tests',

  // Максимальное время выполнения одного теста
  timeout: 30 * 1000,

  // Количество попыток при падении теста
  retries: process.env.CI ? 2 : 0,

  // Количество параллельных worker'ов
  workers: process.env.CI ? 1 : undefined,

  // Настройки репортера
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }]
  ],

  // Общие настройки для всех тестов
  use: {
    // Базовый URL для тестов
    baseURL: 'http://localhost:3000',

    // Скриншот при падении теста
    screenshot: 'only-on-failure',

    // Видео при падении теста (опционально)
    video: 'retain-on-failure',

    // Trace при падении теста - для отладки
    trace: 'retain-on-failure',

    // Таймаут для навигации
    navigationTimeout: 15 * 1000,

    // Таймаут для действий
    actionTimeout: 10 * 1000,
  },

  // Проекты (браузеры)
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      },
    },
  ],

  // Web Server - автоматический запуск dev сервера перед тестами
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
    stderr: 'pipe',
  },

  // Папки для вывода
  outputDir: 'test-results/',
});
