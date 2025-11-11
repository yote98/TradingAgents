# Accessibility Fixes - Quick Reference

## Color Contrast Issues and Solutions

### Issue 1: Primary Button Contrast
**Problem**: Blue-600 (#3b82f6) with white text has 3.68:1 ratio (needs 4.5:1)

**Solution Options**:
1. **Use darker blue** (Recommended):
   ```tsx
   // Replace:
   className="bg-blue-600 hover:bg-blue-700"
   
   // With:
   className="bg-blue-700 hover:bg-blue-800"
   ```
   - Blue-700 (#1d4ed8) = 5.9:1 ratio ✅
   - Blue-800 (#1e40af) = 8.6:1 ratio ✅

2. **Add text shadow** (Alternative):
   ```tsx
   className="bg-blue-600 hover:bg-blue-700 shadow-text"
   ```
   ```css
   .shadow-text {
     text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
   }
   ```

### Issue 2: Muted Text Contrast
**Problem**: Gray-400 (#94a3b8) on white has 2.56:1 ratio (needs 3:1 for large text, 4.5:1 for normal)

**Solution**:
```tsx
// Replace:
className="text-gray-400"

// With:
className="text-gray-600"  // #4b5563 = 7.0:1 ratio ✅
```

### Issue 3: Active Navigation Item
**Problem**: Same as Issue 1 - uses blue-600 background

**Solution**: Apply same fix as Issue 1

## Files to Update

### 1. HomeSection.tsx
```tsx
// Line ~150-160: Quick Action buttons
<button
  className="px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white..."
>
  Run Analysis
</button>
```

### 2. AnalyzeSection.tsx
```tsx
// Line ~200: Run Analysis button
<button
  className="bg-blue-700 hover:bg-blue-800 text-white..."
>
  {running ? 'Running Analysis...' : 'Run Analysis'}
</button>
```

### 3. BacktestSection.tsx
```tsx
// Line ~250: Run Backtest button
<button
  className="bg-blue-700 hover:bg-blue-800 text-white..."
>
  {running ? 'Running Backtest...' : 'Run Backtest'}
</button>
```

### 4. NavItem.tsx
```tsx
// Line ~40: Active state
className={`
  ${active
    ? 'bg-blue-700 text-white border-l-4 border-blue-400'
    : 'text-gray-300 hover:bg-white/10'
  }
`}
```

### 5. All muted text instances
Search for `text-gray-400` and replace with `text-gray-600` where used for informational text.

## Automated Fix Script

Create a script to automatically fix these issues:

```bash
# In aiapp directory
find src -name "*.tsx" -type f -exec sed -i 's/bg-blue-600/bg-blue-700/g' {} +
find src -name "*.tsx" -type f -exec sed -i 's/hover:bg-blue-700/hover:bg-blue-800/g' {} +
```

## Testing After Fixes

Run the accessibility test again:
```bash
node accessibility-test.js
```

Expected results after fixes:
- Color contrast tests: 15/15 passed ✅
- Overall score: 95+ / 100 ✅

## Alternative: Custom Color Palette

If you want to keep the visual appearance but improve contrast, create custom colors in `globals.css`:

```css
:root {
  --blue-accessible: #1d4ed8;  /* Blue-700 */
  --blue-accessible-hover: #1e40af;  /* Blue-800 */
}

.bg-blue-accessible {
  background-color: var(--blue-accessible);
}

.hover\:bg-blue-accessible-hover:hover {
  background-color: var(--blue-accessible-hover);
}
```

Then use:
```tsx
className="bg-blue-accessible hover:bg-blue-accessible-hover"
```

## Verification Checklist

After applying fixes:
- [ ] Run `node accessibility-test.js`
- [ ] Verify all color contrast tests pass
- [ ] Test with screen reader (NVDA/JAWS/VoiceOver)
- [ ] Test keyboard navigation
- [ ] Test on mobile devices
- [ ] Run Lighthouse audit (should score 95+)
- [ ] Run axe DevTools (should have 0 violations)

## Notes

- These fixes maintain the visual design while meeting WCAG AA standards
- Blue-700 is only slightly darker than blue-600 and maintains brand consistency
- All fixes are backwards compatible with existing functionality
- No breaking changes to component APIs

---

**Priority**: High
**Effort**: Low (< 30 minutes)
**Impact**: Ensures WCAG AA compliance for all users
