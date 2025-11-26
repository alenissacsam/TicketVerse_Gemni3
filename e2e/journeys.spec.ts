import { test, expect } from '@playwright/test';

test.describe('User Journeys', () => {
  test('should navigate to home page and display hero', async ({ page }) => {
    await page.goto('/');
    // Wait for intro animation to complete (it takes a few seconds)
    await expect(page.getByText('TICKET VERSE')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Experience the next generation of ticketing.')).toBeVisible();
  });

  test('should navigate to events page', async ({ page }) => {
    await page.goto('/');
    // Wait for sidebar to appear (it has a 3.5s delay)
    await page.waitForSelector('aside.glass-sidebar', { timeout: 10000 });
    
    // Click the "Events" link in the sidebar (href="/events")
    // The text might be hidden in a tooltip, so we target by href or role with hidden: true if needed
    // Or we can click the "Explore Events" button in the hero
    await page.getByRole('link', { name: 'Explore Events' }).click();
    
    await expect(page).toHaveURL('/events');
    await expect(page.getByText('Upcoming Events')).toBeVisible();
  });

  test('should view event details', async ({ page }) => {
    await page.goto('/');
    // Wait for event cards to load
    await page.waitForSelector('.glass-premium', { timeout: 10000 });
    // Click the first event card
    await page.locator('.glass-premium').first().click();
    // Should navigate to event details
    await expect(page).toHaveURL(/\/events\/.+/);
    // Wait for "Buy Tickets" button
    await expect(page.getByRole('button', { name: 'Buy Tickets' })).toBeVisible({ timeout: 10000 });
  });
});
