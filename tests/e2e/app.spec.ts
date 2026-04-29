import { expect, test } from '@playwright/test';

const STORAGE_KEYS = {
  users: 'habit-tracker-users',
  session: 'habit-tracker-session',
  habits: 'habit-tracker-habits',
} as const;

function getDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(dateKey: string, amount: number): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + amount);
  return getDateKey(date);
}

async function seedStorage(
  page: import('@playwright/test').Page,
  data: {
    users?: unknown[];
    session?: unknown;
    habits?: unknown[];
  },
) {
  await page.addInitScript(
    ({ keys, payload }) => {
      if (window.sessionStorage.getItem('__habit-tracker-seeded') === 'true') {
        return;
      }

      window.localStorage.clear();
      window.sessionStorage.clear();

      if (payload.users) {
        window.localStorage.setItem(keys.users, JSON.stringify(payload.users));
      }

      if (payload.session) {
        window.localStorage.setItem(keys.session, JSON.stringify(payload.session));
      }

      if (payload.habits) {
        window.localStorage.setItem(keys.habits, JSON.stringify(payload.habits));
      }

      window.sessionStorage.setItem('__habit-tracker-seeded', 'true');
    },
    {
      keys: STORAGE_KEYS,
      payload: data,
    },
  );
}

test.describe('Habit Tracker app', () => {
  test('shows the splash screen and redirects unauthenticated users to /login', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByTestId('splash-screen')).toBeVisible();
    await page.waitForTimeout(600);
    await expect(page).toHaveURL(/\/$/);
    await page.waitForURL('**/login');
    await expect(page.getByTestId('auth-login-submit')).toBeVisible();
  });

  test('redirects authenticated users from / to /dashboard', async ({ page }) => {
    await seedStorage(page, {
      users: [
        {
          id: 'user-1',
          email: 'person@example.com',
          password: 'secret123',
          createdAt: '2026-04-27T00:00:00.000Z',
        },
      ],
      session: {
        userId: 'user-1',
        email: 'person@example.com',
      },
      habits: [],
    });

    await page.goto('/');

    await expect(page.getByTestId('splash-screen')).toBeVisible();
    await page.waitForURL('**/dashboard');
    await expect(page.getByTestId('dashboard-page')).toBeVisible();
  });

  test('prevents unauthenticated access to /dashboard', async ({ page }) => {
    await page.goto('/dashboard');

    await page.waitForURL('**/login');
    await expect(page.getByTestId('auth-login-submit')).toBeVisible();
  });

  test('signs up a new user and lands on the dashboard', async ({ page }) => {
    await page.goto('/signup');

    await page.getByTestId('auth-signup-email').fill('new-user@example.com');
    await page.getByTestId('auth-signup-password').fill('secret123');
    await page.getByTestId('auth-signup-submit').click();

    await page.waitForURL('**/dashboard');
    await expect(page.getByTestId('dashboard-page')).toBeVisible();

    const session = await page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEYS.session);
    expect(JSON.parse(session ?? 'null')).toEqual({
      userId: expect.any(String),
      email: 'new-user@example.com',
    });
  });

  test("logs in an existing user and loads only that user's habits", async ({ page }) => {
    await seedStorage(page, {
      users: [
        {
          id: 'user-1',
          email: 'person@example.com',
          password: 'secret123',
          createdAt: '2026-04-27T00:00:00.000Z',
        },
        {
          id: 'user-2',
          email: 'other@example.com',
          password: 'secret456',
          createdAt: '2026-04-27T00:00:00.000Z',
        },
      ],
      habits: [
        {
          id: 'habit-1',
          userId: 'user-1',
          name: 'Drink Water',
          description: 'Finish two bottles.',
          frequency: 'daily',
          createdAt: '2026-04-27T00:00:00.000Z',
          completions: [],
        },
        {
          id: 'habit-2',
          userId: 'user-2',
          name: 'Sleep Early',
          description: 'Lights out by 10pm.',
          frequency: 'daily',
          createdAt: '2026-04-27T00:00:00.000Z',
          completions: [],
        },
      ],
    });

    await page.goto('/login');

    await page.getByTestId('auth-login-email').fill('person@example.com');
    await page.getByTestId('auth-login-password').fill('secret123');
    await page.getByTestId('auth-login-submit').click();

    await page.waitForURL('**/dashboard');
    await expect(page.getByTestId('habit-card-drink-water')).toBeVisible();
    await expect(page.locator('[data-testid="habit-card-sleep-early"]')).toHaveCount(0);
  });

  test('creates a habit from the dashboard', async ({ page }) => {
    await seedStorage(page, {
      users: [
        {
          id: 'user-1',
          email: 'person@example.com',
          password: 'secret123',
          createdAt: '2026-04-27T00:00:00.000Z',
        },
      ],
      session: {
        userId: 'user-1',
        email: 'person@example.com',
      },
      habits: [],
    });

    await page.goto('/dashboard');

    await expect(page.getByTestId('dashboard-page')).toBeVisible();
    await page.getByTestId('create-habit-button').click();
    await page.getByTestId('habit-name-input').fill('Practice Guitar');
    await page.getByTestId('habit-description-input').fill('Play for 20 minutes.');
    await page.getByTestId('habit-save-button').click();

    await expect(page.getByTestId('habit-card-practice-guitar')).toBeVisible();
  });

  test('completes a habit for today and updates the streak', async ({ page }) => {
    const today = getDateKey(new Date());
    const yesterday = addDays(today, -1);

    await seedStorage(page, {
      users: [
        {
          id: 'user-1',
          email: 'person@example.com',
          password: 'secret123',
          createdAt: '2026-04-27T00:00:00.000Z',
        },
      ],
      session: {
        userId: 'user-1',
        email: 'person@example.com',
      },
      habits: [
        {
          id: 'habit-1',
          userId: 'user-1',
          name: 'Walk',
          description: 'Take an evening walk.',
          frequency: 'daily',
          createdAt: '2026-04-27T00:00:00.000Z',
          completions: [yesterday],
        },
      ],
    });

    await page.goto('/dashboard');

    await page.getByTestId('habit-complete-walk').click();
    await expect(page.getByTestId('habit-streak-walk')).toHaveText('Current streak: 2');
  });

  test('persists session and habits after page reload', async ({ page }) => {
    await seedStorage(page, {
      users: [
        {
          id: 'user-1',
          email: 'person@example.com',
          password: 'secret123',
          createdAt: '2026-04-27T00:00:00.000Z',
        },
      ],
      session: {
        userId: 'user-1',
        email: 'person@example.com',
      },
      habits: [],
    });

    await page.goto('/dashboard');

    await page.getByTestId('create-habit-button').click();
    await page.getByTestId('habit-name-input').fill('Journal');
    await page.getByTestId('habit-description-input').fill('Write one paragraph.');
    await page.getByTestId('habit-save-button').click();

    await expect(page.getByTestId('habit-card-journal')).toBeVisible();
    await page.reload();
    await expect(page.getByTestId('habit-card-journal')).toBeVisible();

    const session = await page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEYS.session);
    const habits = await page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEYS.habits);

    expect(JSON.parse(session ?? 'null')).toEqual({
      userId: 'user-1',
      email: 'person@example.com',
    });
    expect(JSON.parse(habits ?? '[]')).toHaveLength(1);
  });

  test('logs out and redirects to /login', async ({ page }) => {
    await seedStorage(page, {
      users: [
        {
          id: 'user-1',
          email: 'person@example.com',
          password: 'secret123',
          createdAt: '2026-04-27T00:00:00.000Z',
        },
      ],
      session: {
        userId: 'user-1',
        email: 'person@example.com',
      },
      habits: [],
    });

    await page.goto('/dashboard');

    await page.getByTestId('auth-logout-button').click();
    await page.waitForURL('**/login');
    await expect(page.getByTestId('auth-login-submit')).toBeVisible();

    const session = await page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEYS.session);
    expect(session).toBeNull();
  });

  test('loads the cached app shell when offline after the app has been loaded once', async ({
    page,
    context,
  }) => {
    await page.goto('/login');
    await expect(page.getByTestId('auth-login-submit')).toBeVisible();

    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
    });
    await page.reload();
    await page.waitForFunction(() => navigator.serviceWorker.controller !== null);

    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });

    await expect(page.getByTestId('auth-login-submit')).toBeVisible();
  });
});
