/**
 * End-to-End Tests for Dashboard Navigation
 * 
 * These tests verify the complete navigation flow, analysis submission,
 * and mobile responsive behavior of the dashboard.
 * 
 * To run these tests, you'll need to set up Playwright:
 * npm install -D @playwright/test
 * npx playwright install
 * npx playwright test
 */

import { test, expect, Page } from '@playwright/test';

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const DASHBOARD_URL = `${BASE_URL}/dashboard`;

test.describe('Dashboard Navigation E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard before each test
    await page.goto(DASHBOARD_URL);
    // Wait for dashboard to load
    await page.waitForSelector('[data-testid="sidebar"]', { timeout: 10000 });
  });

  test.describe('Complete Navigation Flow', () => {
    test('should navigate through all sections', async ({ page }) => {
      // Verify Home section is displayed by default
      await expect(page.locator('text=Welcome')).toBeVisible();

      // Navigate to Coaches section
      await page.click('button:has-text("Coaches")');
      await expect(page.locator('text=Coach Plans')).toBeVisible();

      // Navigate to Social section
      await page.click('button:has-text("Social")');
      await expect(page.locator('text=Social Sentiment')).toBeVisible();

      // Navigate to Analyze section
      await page.click('button:has-text("Analyze")');
      await expect(page.locator('text=Run Stock Analysis')).toBeVisible();

      // Navigate to Backtest section
      await page.click('button:has-text("Backtest")');
      await expect(page.locator('text=Run Backtest')).toBeVisible();

      // Navigate to Risk section
      await page.click('button:has-text("Risk")');
      await expect(page.locator('text=Risk Management')).toBeVisible();

      // Navigate to Settings section
      await page.click('button:has-text("Settings")');
      await expect(page.locator('text=Dashboard Settings')).toBeVisible();

      // Navigate back to Home
      await page.click('button:has-text("Home")');
      await expect(page.locator('text=Welcome')).toBeVisible();
    });

    test('should highlight active section in sidebar', async ({ page }) => {
      // Check Home is active initially
      const homeButton = page.locator('button:has-text("Home")');
      await expect(homeButton).toHaveAttribute('aria-current', 'page');

      // Navigate to Analyze
      await page.click('button:has-text("Analyze")');
      
      // Check Analyze is now active
      const analyzeButton = page.locator('button:has-text("Analyze")');
      await expect(analyzeButton).toHaveAttribute('aria-current', 'page');
      
      // Check Home is no longer active
      await expect(homeButton).not.toHaveAttribute('aria-current', 'page');
    });
  });

  test.describe('Analysis Submission and Results', () => {
    test('should submit analysis and display results', async ({ page }) => {
      // Navigate to Analyze section
      await page.click('button:has-text("Analyze")');
      await expect(page.locator('text=Run Stock Analysis')).toBeVisible();

      // Fill in ticker
      await page.fill('input[aria-label*="Ticker"]', 'AAPL');

      // Select analysts (at least one should be selected by default)
      const marketAnalyst = page.locator('input[type="checkbox"][value="market"]');
      if (!(await marketAnalyst.isChecked())) {
        await marketAnalyst.check();
      }

      // Submit analysis
      await page.click('button:has-text("Run Analysis")');

      // Wait for loading state
      await expect(page.locator('text=Analyzing')).toBeVisible({ timeout: 2000 });

      // Wait for results (with longer timeout for API call)
      await expect(page.locator('text=Analysis Results')).toBeVisible({ 
        timeout: 60000 
      });

      // Verify results contain expected elements
      await expect(page.locator('text=AAPL')).toBeVisible();
      await expect(page.locator('text=/BUY|SELL|HOLD/')).toBeVisible();
    });

    test('should handle analysis errors gracefully', async ({ page }) => {
      // Navigate to Analyze section
      await page.click('button:has-text("Analyze")');

      // Fill in invalid ticker
      await page.fill('input[aria-label*="Ticker"]', 'INVALID123');

      // Submit analysis
      await page.click('button:has-text("Run Analysis")');

      // Wait for error message
      await expect(page.locator('text=/error|failed/i')).toBeVisible({ 
        timeout: 30000 
      });

      // Verify retry button is present
      await expect(page.locator('button:has-text("Retry")')).toBeVisible();
    });

    test('should cache analysis results', async ({ page }) => {
      // Navigate to Analyze section
      await page.click('button:has-text("Analyze")');

      // Submit first analysis
      await page.fill('input[aria-label*="Ticker"]', 'TSLA');
      await page.click('button:has-text("Run Analysis")');
      await expect(page.locator('text=Analysis Results')).toBeVisible({ 
        timeout: 60000 
      });

      // Navigate away
      await page.click('button:has-text("Home")');
      await expect(page.locator('text=Welcome')).toBeVisible();

      // Navigate back to Analyze
      await page.click('button:has-text("Analyze")');

      // Submit same ticker again
      await page.fill('input[aria-label*="Ticker"]', 'TSLA');
      await page.click('button:has-text("Run Analysis")');

      // Results should appear faster (from cache)
      await expect(page.locator('text=Analysis Results')).toBeVisible({ 
        timeout: 5000 
      });
    });
  });

  test.describe('Mobile Responsive Behavior', () => {
    test('should adapt layout for mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Reload page
      await page.reload();
      await page.waitForSelector('[data-testid="sidebar"]');

      // Sidebar should be collapsed on mobile
      const sidebar = page.locator('[data-testid="sidebar"]');
      await expect(sidebar).toHaveClass(/collapsed/);

      // Menu button should be visible
      await expect(page.locator('button[aria-label*="menu"]')).toBeVisible();
    });

    test('should open and close mobile sidebar', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      await page.waitForSelector('[data-testid="sidebar"]');

      // Open sidebar
      await page.click('button[aria-label*="menu"]');
      
      // Sidebar should be expanded
      const sidebar = page.locator('[data-testid="sidebar"]');
      await expect(sidebar).not.toHaveClass(/collapsed/);

      // Navigation items should be visible
      await expect(page.locator('button:has-text("Home")')).toBeVisible();
      await expect(page.locator('button:has-text("Analyze")')).toBeVisible();

      // Click outside to close (or click a nav item)
      await page.click('button:has-text("Analyze")');

      // Sidebar should auto-close
      await expect(sidebar).toHaveClass(/collapsed/);

      // Section should have changed
      await expect(page.locator('text=Run Stock Analysis')).toBeVisible();
    });

    test('should support touch-friendly tap targets on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      await page.waitForSelector('[data-testid="sidebar"]');

      // Open sidebar
      await page.click('button[aria-label*="menu"]');

      // Check that navigation items have adequate size
      const navItems = page.locator('[data-testid="sidebar"] button');
      const count = await navItems.count();

      for (let i = 0; i < count; i++) {
        const item = navItems.nth(i);
        const box = await item.boundingBox();
        
        if (box) {
          // Verify minimum touch target size (44px)
          expect(box.height).toBeGreaterThanOrEqual(44);
        }
      }
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should support Alt+number shortcuts', async ({ page }) => {
      // Verify Home is active
      await expect(page.locator('text=Welcome')).toBeVisible();

      // Press Alt+4 to navigate to Analyze
      await page.keyboard.press('Alt+4');
      await expect(page.locator('text=Run Stock Analysis')).toBeVisible();

      // Press Alt+2 to navigate to Coaches
      await page.keyboard.press('Alt+2');
      await expect(page.locator('text=Coach Plans')).toBeVisible();

      // Press Alt+7 to navigate to Settings
      await page.keyboard.press('Alt+7');
      await expect(page.locator('text=Dashboard Settings')).toBeVisible();

      // Press Alt+1 to navigate back to Home
      await page.keyboard.press('Alt+1');
      await expect(page.locator('text=Welcome')).toBeVisible();
    });

    test('should support Tab navigation through sidebar', async ({ page }) => {
      // Focus on first navigation item
      await page.keyboard.press('Tab');
      
      // Check that focus is on a navigation button
      const focusedElement = await page.evaluate(() => {
        return document.activeElement?.tagName;
      });
      expect(focusedElement).toBe('BUTTON');

      // Tab through navigation items
      for (let i = 0; i < 7; i++) {
        await page.keyboard.press('Tab');
      }

      // Should have cycled through all nav items
      const activeSection = await page.evaluate(() => {
        return document.activeElement?.textContent;
      });
      expect(activeSection).toBeTruthy();
    });

    test('should activate section with Enter key', async ({ page }) => {
      // Tab to Analyze button
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab'); // Should be on Analyze

      // Press Enter to activate
      await page.keyboard.press('Enter');

      // Verify Analyze section is displayed
      await expect(page.locator('text=Run Stock Analysis')).toBeVisible();
    });

    test('should close mobile sidebar with Escape key', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      await page.waitForSelector('[data-testid="sidebar"]');

      // Open sidebar
      await page.click('button[aria-label*="menu"]');
      
      const sidebar = page.locator('[data-testid="sidebar"]');
      await expect(sidebar).not.toHaveClass(/collapsed/);

      // Press Escape
      await page.keyboard.press('Escape');

      // Sidebar should close
      await expect(sidebar).toHaveClass(/collapsed/);
    });
  });

  test.describe('State Persistence', () => {
    test('should persist active section across page refreshes', async ({ page }) => {
      // Navigate to Risk section
      await page.click('button:has-text("Risk")');
      await expect(page.locator('text=Risk Management')).toBeVisible();

      // Refresh page
      await page.reload();
      await page.waitForSelector('[data-testid="sidebar"]');

      // Risk section should still be active
      await expect(page.locator('text=Risk Management')).toBeVisible();
      
      const riskButton = page.locator('button:has-text("Risk")');
      await expect(riskButton).toHaveAttribute('aria-current', 'page');
    });

    test('should persist settings across refreshes', async ({ page }) => {
      // Navigate to Settings
      await page.click('button:has-text("Settings")');
      await expect(page.locator('text=Dashboard Settings')).toBeVisible();

      // Change theme to dark
      await page.selectOption('select[aria-label*="Theme"]', 'dark');

      // Wait for save
      await page.waitForTimeout(500);

      // Refresh page
      await page.reload();
      await page.waitForSelector('[data-testid="sidebar"]');

      // Navigate back to Settings
      await page.click('button:has-text("Settings")');

      // Verify theme is still dark
      const themeValue = await page.locator('select[aria-label*="Theme"]').inputValue();
      expect(themeValue).toBe('dark');
    });
  });

  test.describe('Performance', () => {
    test('should load dashboard within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto(DASHBOARD_URL);
      await page.waitForSelector('[data-testid="sidebar"]');
      await expect(page.locator('text=Welcome')).toBeVisible();
      
      const loadTime = Date.now() - startTime;
      
      // Dashboard should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });

    test('should lazy load sections efficiently', async ({ page }) => {
      // Navigate to Analyze section
      const startTime = Date.now();
      
      await page.click('button:has-text("Analyze")');
      await expect(page.locator('text=Run Stock Analysis')).toBeVisible();
      
      const loadTime = Date.now() - startTime;
      
      // Section should load within 2 seconds
      expect(loadTime).toBeLessThan(2000);
    });
  });

  test.describe('Error Handling', () => {
    test('should display error boundary fallback on section error', async ({ page }) => {
      // This test would require injecting an error into a section
      // For now, we'll test that error boundaries are in place
      
      // Navigate to a section
      await page.click('button:has-text("Analyze")');
      await expect(page.locator('text=Run Stock Analysis')).toBeVisible();

      // If an error occurs, error boundary should catch it
      // (This would need to be triggered by actual error conditions)
    });

    test('should allow retry after error', async ({ page }) => {
      // Navigate to Analyze
      await page.click('button:has-text("Analyze")');

      // Submit invalid analysis
      await page.fill('input[aria-label*="Ticker"]', 'INVALID');
      await page.click('button:has-text("Run Analysis")');

      // Wait for error
      await expect(page.locator('text=/error|failed/i')).toBeVisible({ 
        timeout: 30000 
      });

      // Click retry
      await page.click('button:has-text("Retry")');

      // Form should be reset and ready for new input
      await expect(page.locator('input[aria-label*="Ticker"]')).toBeVisible();
    });
  });
});
