import { test, expect } from '@playwright/test';

test.describe('n8n Assist Extension Tests', () => {
  test('should inject chat button on n8n workflow page', async ({ page }) => {
    // Mock n8n workflow page
    await page.goto('http://localhost:5678/workflow/123');
    
    // Wait for content script to inject
    await page.waitForTimeout(1000);
    
    // Check if chat button is present
    const chatButton = page.locator('#n8n-assist-container');
    await expect(chatButton).toBeVisible();
  });

  test('should open settings page', async ({ page }) => {
    // Navigate to extension options page
    await page.goto('chrome-extension://test/options.html');
    
    // Check if settings form is present
    const apiKeyInput = page.locator('#apiKey');
    const modelSelect = page.locator('#model');
    const saveButton = page.locator('button:has-text("Save Settings")');
    
    await expect(apiKeyInput).toBeVisible();
    await expect(modelSelect).toBeVisible();
    await expect(saveButton).toBeVisible();
  });

  test('should save and validate API key', async ({ page }) => {
    await page.goto('chrome-extension://test/options.html');
    
    // Fill in API key
    await page.fill('#apiKey', 'test-api-key');
    
    // Click save button
    await page.click('button:has-text("Save Settings")');
    
    // Should show validation message
    await expect(page.locator('text=Invalid API key')).toBeVisible();
  });
});