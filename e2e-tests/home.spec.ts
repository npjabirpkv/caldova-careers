import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Derive the expected posting count from the job content collection so this
// assertion stays correct as roles are added or removed.
const jobsDir = fileURLToPath(new URL('../src/content/jobs', import.meta.url));
const expectedRoleCount = readdirSync(jobsDir).filter((f) => f.endsWith('.md')).length;

test.describe('Open roles listing', () => {
    test('shows the roles grid with all postings', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByRole('heading', { name: 'Open roles' })).toBeVisible();

        const grid = page.getByTestId('roles-grid');
        await expect(grid).toBeVisible();
        await expect(page.locator('[data-testid="role-card"]:visible')).toHaveCount(
            expectedRoleCount,
        );
    });

    test('links through to a role detail page', async ({ page }) => {
        await page.goto('/');
        const firstCard = page.getByTestId('role-card').first();
        const title = await firstCard.getByTestId('role-title').textContent();
        await firstCard.click();
        await expect(page.getByTestId('role-detail-title')).toHaveText(title!.trim());
        await expect(page.getByTestId('apply-form')).toBeVisible();
    });

    test('filters roles by department and remote status together', async ({ page }) => {
        await page.goto('/');
        const visibleCards = page.locator('[data-testid="role-card"]:visible');

        await page.getByTestId('department-filter').selectOption('Technology');
        await expect(visibleCards).toHaveCount(2);

        await page.getByTestId('remote-filter').selectOption('on-site');
        await expect(visibleCards).toHaveCount(0);
        await expect(page.getByTestId('no-filter-results')).toBeVisible();

        await page.getByTestId('remote-filter').selectOption('remote');
        await expect(visibleCards).toHaveCount(2);
        await expect(
            page.getByTestId('role-title').filter({ hasText: 'Senior Frontend Engineer' }),
        ).toBeVisible();
        await expect(page.getByTestId('no-filter-results')).toBeHidden();

        await page.getByTestId('department-filter').selectOption('');
        await page.getByTestId('remote-filter').selectOption('');
        await expect(visibleCards).toHaveCount(expectedRoleCount);
    });

    test('filters by employment type and shows when no roles match', async ({ page }) => {
        await page.goto('/');
        const visibleCards = page.locator('[data-testid="role-card"]:visible');

        await page.getByTestId('employment-type-filter').selectOption('Contract');
        await expect(visibleCards).toHaveCount(1);
        await expect(visibleCards.first().getByTestId('role-title')).toHaveText('Procurement Analyst');

        await page.getByTestId('department-filter').selectOption('Technology');
        await expect(visibleCards).toHaveCount(0);
        await expect(page.getByTestId('no-filter-results')).toBeVisible();
    });

    for (const { title, location } of [
        { title: 'Senior Frontend Engineer', location: 'Remote (US & Canada)' },
        { title: 'Financial Analyst', location: 'Woodinville, WA, USA' },
    ]) {
        test(`keeps ${title} location on details, not starter cards`, async ({ page }) => {
            await page.goto('/');
            const card = page.getByTestId('role-card').filter({
                has: page.getByRole('heading', { name: title, exact: true }),
            });

            await expect(card).toBeVisible();
            await expect(card.getByText(location, { exact: true })).toHaveCount(0);
            await card.click();
            await expect(page.getByText(location, { exact: true })).toBeVisible();
        });
    }

    test('has no automatically detectable accessibility violations', async ({ page }) => {
        await page.goto('/');
        const results = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa'])
            .analyze();
        expect(results.violations).toEqual([]);
    });
});
