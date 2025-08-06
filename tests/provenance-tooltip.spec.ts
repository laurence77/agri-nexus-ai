import { test, expect } from '@playwright/test';

// Utility: checks if a tooltip appears on hover for a selector
async function expectProvenanceTooltip(page, selector: string) {
  await page.hover(selector);
  // Wait for tooltip to appear (adjust selector if needed)
  await expect(page.locator('[role="tooltip"]')).toBeVisible({ timeout: 2000 });
}

test.describe('Provenance Tooltip Integration', () => {
  test('Marketplace product cards show provenance tooltips', async ({ page }) => {
    await page.goto('/marketplace');
    // Example selectors: adjust to actual data-testid or className if available
    await expectProvenanceTooltip(page, '[data-testid="product-name"]');
    await expectProvenanceTooltip(page, '[data-testid="product-price"]');
    await expectProvenanceTooltip(page, '[data-testid="product-quantity"]');
    await expectProvenanceTooltip(page, '[data-testid="product-quality"]');
    await expectProvenanceTooltip(page, '[data-testid="product-seller-name"]');
    await expectProvenanceTooltip(page, '[data-testid="product-seller-rating"]');
  });

  test('AdminDashboard tables show provenance tooltips', async ({ page }) => {
    await page.goto('/admin');
    // Orders table
    await expectProvenanceTooltip(page, '[data-testid="order-id"]');
    await expectProvenanceTooltip(page, '[data-testid="order-status"]');
    await expectProvenanceTooltip(page, '[data-testid="order-amount"]');
    await expectProvenanceTooltip(page, '[data-testid="order-customer"]');
    await expectProvenanceTooltip(page, '[data-testid="order-created"]');
    // Deliveries table
    await expectProvenanceTooltip(page, '[data-testid="delivery-id"]');
    await expectProvenanceTooltip(page, '[data-testid="delivery-product"]');
    await expectProvenanceTooltip(page, '[data-testid="delivery-quantity"]');
    await expectProvenanceTooltip(page, '[data-testid="delivery-destination"]');
    await expectProvenanceTooltip(page, '[data-testid="delivery-driver"]');
    await expectProvenanceTooltip(page, '[data-testid="delivery-status"]');
    // Reviews table
    await expectProvenanceTooltip(page, '[data-testid="review-id"]');
    await expectProvenanceTooltip(page, '[data-testid="review-product"]');
    await expectProvenanceTooltip(page, '[data-testid="review-rating"]');
    await expectProvenanceTooltip(page, '[data-testid="review-reviewer"]');
    await expectProvenanceTooltip(page, '[data-testid="review-comment"]');
    await expectProvenanceTooltip(page, '[data-testid="review-created"]');
  });

  test('CustomerDashboard inventory shows provenance tooltips', async ({ page }) => {
    await page.goto('/customer');
    await expectProvenanceTooltip(page, '[data-testid="inventory-item-name"]');
    await expectProvenanceTooltip(page, '[data-testid="inventory-category"]');
    await expectProvenanceTooltip(page, '[data-testid="inventory-current-stock"]');
    await expectProvenanceTooltip(page, '[data-testid="inventory-unit"]');
    await expectProvenanceTooltip(page, '[data-testid="inventory-minimum-stock"]');
  });
});
