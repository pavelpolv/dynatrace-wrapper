import { test, expect } from '@playwright/test';

/**
 * E2E тесты для модуля Orders
 * Проверяют работу списка заказов и детальной страницы
 */

test.describe('Orders Module', () => {
  test.describe('Orders List Page', () => {
    test('should display page title and header', async ({ page }) => {
      await page.goto('/order');

      // Проверяем заголовок страницы
      await expect(page.locator('h1')).toContainText('Orders List');
    });

    test('should display loading spinner initially', async ({ page }) => {
      await page.goto('/order');

      // Проверяем, что спиннер появляется
      const spinner = page.locator('.ant-spin');
      await expect(spinner).toBeAttached();
    });

    test('should load orders table successfully', async ({ page }) => {
      await page.goto('/order');

      // Ждем загрузки данных (API endpoint '/users' должен работать корректно)
      await page.waitForSelector('.ant-table', { timeout: 10000 });

      // Проверяем наличие таблицы
      const table = page.locator('.ant-table');
      await expect(table).toBeVisible();
    });

    test('should display correct table columns', async ({ page }) => {
      await page.goto('/order');

      // Ждем загрузки таблицы
      await page.waitForSelector('.ant-table', { timeout: 10000 });

      // Проверяем заголовки колонок
      await expect(page.locator('th:has-text("Order ID")')).toBeVisible();
      await expect(page.locator('th:has-text("Customer Name")')).toBeVisible();
      await expect(page.locator('th:has-text("Email")')).toBeVisible();
      await expect(page.locator('th:has-text("Phone")')).toBeVisible();
      await expect(page.locator('th:has-text("Action")')).toBeVisible();
    });

    test('should display order rows with data', async ({ page }) => {
      await page.goto('/order');

      // Ждем загрузки данных
      await page.waitForSelector('.ant-table-tbody tr', { timeout: 10000 });

      // Проверяем наличие строк в таблице
      const rows = page.locator('.ant-table-tbody tr');
      const rowCount = await rows.count();
      expect(rowCount).toBeGreaterThan(0);

      // Проверяем наличие данных в первой строке
      const firstRow = rows.first();
      await expect(firstRow).toBeVisible();
    });

    test('should have "View Details" buttons', async ({ page }) => {
      await page.goto('/order');

      // Ждем загрузки данных
      await page.waitForSelector('button:has-text("View Details")', { timeout: 10000 });

      // Проверяем наличие кнопок "View Details"
      const viewButtons = page.locator('button:has-text("View Details")');
      const buttonCount = await viewButtons.count();
      expect(buttonCount).toBeGreaterThan(0);
    });

    test('should have working pagination', async ({ page }) => {
      await page.goto('/order');

      // Ждем загрузки данных
      await page.waitForSelector('.ant-pagination', { timeout: 10000 });

      // Проверяем наличие пагинации
      const pagination = page.locator('.ant-pagination');
      await expect(pagination).toBeVisible();

      // Проверяем, что по умолчанию pageSize = 10
      const rows = page.locator('.ant-table-tbody tr');
      const rowCount = await rows.count();
      expect(rowCount).toBeLessThanOrEqual(10);
    });

    test('should display customer data in table cells', async ({ page }) => {
      await page.goto('/order');

      // Ждем загрузки данных
      await page.waitForSelector('.ant-table-tbody tr', { timeout: 10000 });

      // Проверяем, что в таблице есть email (характерный признак данных /users)
      const emailCells = page.locator('td').filter({ hasText: '@' });
      const emailCount = await emailCells.count();
      expect(emailCount).toBeGreaterThan(0);
    });

    test('should have proper page layout', async ({ page }) => {
      await page.goto('/order');

      // Проверяем наличие основного контейнера с padding
      const container = page.locator('div[style*="padding"]');
      await expect(container).toBeVisible();
    });
  });

  test.describe('Navigation', () => {
    test('should be accessible via direct URL', async ({ page }) => {
      await page.goto('/order');

      // Проверяем, что мы на странице orders
      await expect(page).toHaveURL('/order');
      await expect(page.locator('h1:has-text("Orders List")')).toBeVisible();
    });

    test('should be accessible via Sidebar navigation', async ({ page }) => {
      await page.goto('/');

      // Ищем ссылку Orders в Sidebar
      const ordersLink = page.locator('a[href="/order"]');

      // Кликаем на ссылку если она есть
      if (await ordersLink.isVisible()) {
        await ordersLink.click();
        await expect(page).toHaveURL('/order');
        await expect(page.locator('h1:has-text("Orders List")')).toBeVisible();
      }
    });
  });

  test.describe('Order Details Navigation', () => {
    test('should navigate to order details on button click', async ({ page }) => {
      await page.goto('/order');

      // Ждем загрузки данных
      await page.waitForSelector('button:has-text("View Details")', { timeout: 10000 });

      // Кликаем на первую кнопку "View Details"
      await page.locator('button:has-text("View Details")').first().click();

      // Проверяем, что URL изменился на детальную страницу
      await expect(page).toHaveURL(/\/order\/\d+/);
    });

    test('should navigate to correct order detail page', async ({ page }) => {
      await page.goto('/order');

      // Ждем загрузки данных
      await page.waitForSelector('.ant-table-tbody tr', { timeout: 10000 });

      // Получаем ID первого заказа
      const firstRowId = await page.locator('.ant-table-tbody tr').first()
        .locator('td').first().textContent();

      // Кликаем на кнопку "View Details"
      await page.locator('button:has-text("View Details")').first().click();

      // Проверяем, что URL содержит правильный ID
      await expect(page).toHaveURL(`/order/${firstRowId}`);
    });
  });

  test.describe('Module Federation Integration', () => {
    test('should load Orders module from remote', async ({ page }) => {
      await page.goto('/order');

      // Проверяем, что модуль загрузился и отрендерился
      await expect(page.locator('h1:has-text("Orders List")')).toBeVisible();

      // Проверяем отсутствие ошибок Module Federation в консоли
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      // Даем время на возможные ошибки
      await page.waitForTimeout(2000);

      // Фильтруем только ошибки, связанные с Module Federation
      const federationErrors = errors.filter(err =>
        err.includes('Module Federation') ||
        err.includes('remoteEntry')
      );

      expect(federationErrors).toHaveLength(0);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle API errors gracefully', async ({ page }) => {
      // Перехватываем API запрос и возвращаем ошибку
      await page.route('**/users', route => {
        route.abort('failed');
      });

      await page.goto('/order');

      // Проверяем, что показывается сообщение об ошибке
      const errorAlert = page.locator('.ant-alert-error');
      await expect(errorAlert).toBeVisible({ timeout: 10000 });
      await expect(errorAlert).toContainText('Failed to load orders');
    });

    test('should not display table when error occurs', async ({ page }) => {
      // Перехватываем API запрос и возвращаем ошибку
      await page.route('**/users', route => {
        route.abort('failed');
      });

      await page.goto('/order');

      // Ждем появления ошибки
      await page.waitForSelector('.ant-alert-error', { timeout: 10000 });

      // Проверяем, что таблица не отображается
      const table = page.locator('.ant-table');
      await expect(table).not.toBeVisible();
    });
  });

  test.describe('Data Validation', () => {
    test('should display valid email addresses', async ({ page }) => {
      await page.goto('/order');

      // Ждем загрузки данных
      await page.waitForSelector('.ant-table-tbody tr', { timeout: 10000 });

      // Получаем все email ячейки
      const emailCells = page.locator('td').filter({ hasText: '@' });
      const firstEmail = await emailCells.first().textContent();

      // Проверяем, что email содержит @ и .
      expect(firstEmail).toContain('@');
      expect(firstEmail).toMatch(/\./);
    });

    test('should display numeric order IDs', async ({ page }) => {
      await page.goto('/order');

      // Ждем загрузки данных
      await page.waitForSelector('.ant-table-tbody tr', { timeout: 10000 });

      // Получаем первый ID
      const firstId = await page.locator('.ant-table-tbody tr').first()
        .locator('td').first().textContent();

      // Проверяем, что ID - это число
      expect(Number(firstId)).not.toBeNaN();
      expect(Number(firstId)).toBeGreaterThan(0);
    });
  });
});
