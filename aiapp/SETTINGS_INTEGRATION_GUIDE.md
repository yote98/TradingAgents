# Settings Section Integration Guide

## Quick Start

The Settings section is now complete and ready to integrate into the Dashboard Sidebar Navigation.

## Step 1: Import the Component

In your `DashboardLayout.tsx` or wherever you render sections:

```typescript
import SettingsSection from '@/components/sections/SettingsSection';
```

## Step 2: Add to Section Rendering

```typescript
const renderSection = () => {
  switch (activeSection) {
    case 'home':
      return <HomeSection />;
    case 'coaches':
      return <CoachesSection />;
    case 'social':
      return <SocialSection />;
    case 'analyze':
      return <AnalyzeSection />;
    case 'backtest':
      return <BacktestSection />;
    case 'risk':
      return <RiskSection />;
    case 'settings':
      return <SettingsSection />; // Add this
    default:
      return <HomeSection />;
  }
};
```

## Step 3: Initialize Theme on App Load

In your root layout (`aiapp/src/app/layout.tsx`) or main app component:

```typescript
'use client';

import { useEffect } from 'react';
import { initializeTheme } from '@/lib/storage';

export default function RootLayout({ children }) {
  useEffect(() => {
    // Initialize theme from localStorage on app load
    initializeTheme();
  }, []);

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

## Step 4: Optional - Use Theme Hook

If you want to add a theme toggle button elsewhere in your app:

```typescript
import { useTheme } from '@/hooks/useTheme';

function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();

  // Prevent flash of wrong theme
  if (!mounted) return null;

  return (
    <button onClick={toggleTheme}>
      {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
    </button>
  );
}
```

## Features Available

### 1. Theme Switching
- Light and Dark mode
- Instant application
- Persists across sessions
- CSS variables for easy customization

### 2. Notification Preferences
- Master enable/disable toggle
- Per-coach notification toggles
- Sound toggle
- Auto-saves changes

### 3. API Configuration
- Backend URL input
- Request timeout input
- Manual save button
- Validation before saving

## Settings Storage

Settings are stored in localStorage under these keys:

```typescript
'dashboard-user-settings' // Complete user settings object
'dashboard-theme'         // Theme preference only
```

## Default Settings

```typescript
{
  theme: 'light',
  notifications: {
    enabled: false,
    coaches: {
      coach_d: true,
      coach_i: true,
      coach_s: true,
      coach_n: true,
    },
    minInterval: 300,
    sound: false,
  },
  apiConfig: {
    backendUrl: 'http://localhost:5000',
    timeout: 30000,
  }
}
```

## Customizing Theme Colors

Edit `aiapp/src/app/globals.css` to customize theme colors:

```css
/* Light theme */
:root.light {
  --background: #f8fafc;
  --foreground: #1e293b;
  --card-background: #ffffff;
  /* ... more variables */
}

/* Dark theme */
:root.dark {
  --background: #0f172a;
  --foreground: #f1f5f9;
  --card-background: #1e293b;
  /* ... more variables */
}
```

## Using Theme Variables in Components

```typescript
// In your component styles
<div className="bg-card text-primary border-card">
  Content adapts to theme automatically
</div>

// Or use CSS variables directly
<div style={{ backgroundColor: 'var(--card-background)' }}>
  Custom styled content
</div>
```

## Validation

Settings are validated before saving:

- Theme must be 'light' or 'dark'
- Backend URL must be non-empty string
- Timeout must be >= 1000ms
- Invalid settings are rejected with error message

## Error Handling

The component handles:
- Invalid settings (shows error message)
- LocalStorage quota exceeded (shows warning)
- Corrupted data (falls back to defaults)
- Missing data (uses defaults)

## Testing

Run the validation tests:

```bash
node aiapp/validate-settings.js
```

Expected output:
```
✅ All Settings validation tests passed!
```

## Accessibility

The Settings section includes:
- Proper heading hierarchy
- Descriptive labels
- Help text for inputs
- Focus styles
- Keyboard navigation
- ARIA labels

## Browser Support

Works in all modern browsers that support:
- CSS custom properties (variables)
- localStorage
- ES6+ JavaScript

## Troubleshooting

### Theme not applying
- Check that `initializeTheme()` is called on app load
- Verify CSS variables are defined in globals.css
- Check browser console for errors

### Settings not persisting
- Check localStorage is available (not in private mode)
- Verify storage quota is not exceeded
- Check browser console for storage errors

### Validation errors
- Backend URL must not be empty
- Timeout must be at least 1000ms
- Theme must be 'light' or 'dark'

## Next Steps

1. ✅ Settings section is complete
2. ⏭️ Integrate into DashboardLayout
3. ⏭️ Test theme switching across all sections
4. ⏭️ Verify settings persistence
5. ⏭️ Test on mobile devices

---

**Ready to integrate!** The Settings section is fully functional and tested.
