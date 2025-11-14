# End-to-End Tests for Dashboard Navigation

This directory contains end-to-end tests for the Dashboard Sidebar Navigation feature using Playwright.

## Setup

### 1. Install Playwright

```bash
cd aiapp
npm install -D @playwright/test
npx playwright install
```

### 2. Install Browser Dependencies (if needed)

```bash
npx playwright install-deps
```

## Running Tests

### Run all tests

```bash
npx playwright test
```

### Run tests in UI mode (interactive)

```bash
npx playwright test --ui
```

### Run tests in headed mode (see browser)

```bash
npx playwright test --headed
```

### Run specific test file

```bash
npx playwright test e2e/dashboard-navigation.spec.ts
```

### Run tests for specific browser

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Run tests for mobile

```bash
npx playwright test --project="Mobile Chrome"
npx playwright test --project="Mobile Safari"
```

## Test Reports

After running tests, view the HTML report:

```bash
npx playwright show-report
```

## Test Structure

The test suite covers:

1. **Complete Navigation Flow**
   - Navigation through all sections
   - Active section highlighting

2. **Analysis Submission and Results**
   - Submitting analysis requests
   - Displaying results
   - Error handling
   - Result caching

3. **Mobile Responsive Behavior**
   - Layout adaptation for mobile
   - Sidebar open/close on mobile
   - Touch-friendly tap targets

4. **Keyboard Navigation**
   - Alt+number shortcuts
   - Tab navigation
   - Enter key activation
   - Escape key to close sidebar

5. **State Persistence**
   - Active section persistence across refreshes
   - Settings persistence

6. **Performance**
   - Dashboard load time
   - Section lazy loading

7. **Error Handling**
   - Error boundary fallbacks
   - Retry functionality

## Configuration

The test configuration is in `playwright.config.ts`. Key settings:

- **Base URL**: `http://localhost:3000` (configurable via `BASE_URL` env var)
- **Timeout**: 30 seconds per test
- **Retries**: 2 on CI, 0 locally
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Dev Server**: Automatically starts Next.js dev server before tests

## Environment Variables

- `BASE_URL`: Base URL for the application (default: `http://localhost:3000`)
- `CI`: Set to `true` on CI environments for different retry/worker settings

## Debugging Tests

### Debug specific test

```bash
npx playwright test --debug e2e/dashboard-navigation.spec.ts
```

### Generate test code (Codegen)

```bash
npx playwright codegen http://localhost:3000/dashboard
```

### View trace files

```bash
npx playwright show-trace trace.zip
```

## Best Practices

1. **Wait for elements**: Always use `waitFor` or `expect` with visibility checks
2. **Use data-testid**: Prefer `data-testid` attributes for stable selectors
3. **Avoid hard waits**: Use `waitForSelector` instead of `waitForTimeout`
4. **Test isolation**: Each test should be independent and not rely on others
5. **Clean state**: Use `beforeEach` to ensure clean state for each test

## Troubleshooting

### Tests timing out

- Increase timeout in test or config
- Check if dev server is running
- Verify network requests are completing

### Elements not found

- Check if element selectors are correct
- Verify element is visible (not hidden by CSS)
- Add explicit waits for dynamic content

### Flaky tests

- Add proper waits for async operations
- Use `waitForLoadState` for page loads
- Increase retries in config

## CI/CD Integration

To run tests in CI:

```yaml
# Example GitHub Actions workflow
- name: Install dependencies
  run: npm ci
  
- name: Install Playwright Browsers
  run: npx playwright install --with-deps
  
- name: Run Playwright tests
  run: npx playwright test
  
- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
