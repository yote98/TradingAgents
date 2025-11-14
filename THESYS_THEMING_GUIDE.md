# Thesys C1 Theming - Complete Guide

## Overview

Thesys C1 provides a flexible theming system that allows you to customize the appearance of your chat interface to match your brand.

## Pre-built Themes

### Available Themes

Thesys provides several pre-built themes in the playground:

**1. Jade (Teal)** ⭐ Your Choice
```tsx
{
  primary: '#14b8a6',
  background: '#0a2e2e → #0d3d3d',
  style: 'Professional, modern, calming'
}
```

**2. Carbon (Black)**
```tsx
{
  primary: '#000000',
  background: '#0a0a0a',
  style: 'Minimalist, high contrast, bold'
}
```

**3. Classic (Blue)**
```tsx
{
  primary: '#3b82f6',
  background: '#0f172a',
  style: 'Traditional, trustworthy, corporate'
}
```

**4. Neon (Yellow)**
```tsx
{
  primary: '#facc15',
  background: '#1a1a1a',
  style: 'Bold, energetic, modern'
}
```

**5. Play (Pink)**
```tsx
{
  primary: '#ec4899',
  background: '#1e1b2e',
  style: 'Fun, creative, vibrant'
}
```

**6. Retro90s (Blue)**
```tsx
{
  primary: '#60a5fa',
  background: '#1e3a8a',
  style: 'Nostalgic, retro, playful'
}
```

**7. Nicoope (Light Blue)**
```tsx
{
  primary: '#38bdf8',
  background: '#0c4a6e',
  style: 'Fresh, clean, modern'
}
```

**8. Clean (White)**
```tsx
{
  primary: '#ffffff',
  background: '#000000',
  style: 'Minimal, stark, high contrast'
}
```

**9. Charcoal (Dark Gray)**
```tsx
{
  primary: '#4b5563',
  background: '#111827',
  style: 'Subtle, professional, muted'
}
```

**10. Crimson (Red)**
```tsx
{
  primary: '#dc2626',
  background: '#1a0a0a',
  style: 'Bold, urgent, attention-grabbing'
}
```

## Custom Theming

### Method 1: CSS Variables (Recommended)

```tsx
<div style={{
  // Core Colors
  ['--c1-primary-color' as string]: '#14b8a6',
  ['--c1-background-color' as string]: '#0d1b1b',
  ['--c1-text-color' as string]: '#ffffff',
  ['--c1-secondary-color' as string]: '#64748b',
  
  // Input
  ['--c1-input-background' as string]: 'rgba(255,255,255,0.95)',
  ['--c1-input-text-color' as string]: '#1a1a1a',
  ['--c1-input-border-color' as string]: 'rgba(255,255,255,0.2)',
  
  // Messages
  ['--c1-user-message-bg' as string]: 'rgba(20,184,166,0.2)',
  ['--c1-assistant-message-bg' as string]: 'rgba(255,255,255,0.08)',
  
  // Typography
  ['--c1-font-family' as string]: 'Inter, sans-serif',
  ['--c1-font-size' as string]: '14px',
  
  // Spacing
  ['--c1-border-radius' as string]: '12px',
  ['--c1-message-spacing' as string]: '12px',
}}>
  <C1Chat />
</div>
```

### Method 2: Theme Object

```tsx
const jadeTheme = {
  colors: {
    primary: '#14b8a6',
    background: '#0d1b1b',
    text: '#ffffff',
    secondary: '#64748b',
    border: 'rgba(20,184,166,0.2)',
  },
  input: {
    background: 'rgba(255,255,255,0.95)',
    textColor: '#1a1a1a',
    borderRadius: '12px',
    padding: '12px 16px',
  },
  messages: {
    userBg: 'rgba(20,184,166,0.2)',
    assistantBg: 'rgba(255,255,255,0.08)',
    borderRadius: '12px',
    maxWidth: '80%',
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    fontSize: '14px',
    lineHeight: '1.5',
  },
};

// Apply theme
<div style={Object.entries(jadeTheme.colors).reduce((acc, [key, value]) => ({
  ...acc,
  [`--c1-${key}-color` as string]: value
}), {})}>
  <C1Chat />
</div>
```

### Method 3: Dynamic Theme Switching

```tsx
const themes = {
  jade: {
    primary: '#14b8a6',
    background: 'linear-gradient(180deg, #0a2e2e 0%, #0d3d3d 100%)',
  },
  carbon: {
    primary: '#000000',
    background: '#0a0a0a',
  },
  classic: {
    primary: '#3b82f6',
    background: '#0f172a',
  },
};

const [currentTheme, setCurrentTheme] = useState('jade');

<div style={{
  ['--c1-primary-color' as string]: themes[currentTheme].primary,
  background: themes[currentTheme].background,
}}>
  <C1Chat />
  
  <ThemeSwitcher onChange={setCurrentTheme} />
</div>
```

## Complete Theme Configuration

### Full Jade Theme (Your Implementation)

```tsx
const jadeThemeConfig = {
  // Container
  background: 'linear-gradient(180deg, #0a2e2e 0%, #0d3d3d 50%, #0a2525 100%)',
  
  // CSS Variables
  ['--c1-primary-color' as string]: '#14b8a6',
  ['--c1-background-color' as string]: '#0d1b1b',
  ['--c1-text-color' as string]: '#ffffff',
  ['--c1-secondary-color' as string]: '#64748b',
  ['--c1-border-color' as string]: 'rgba(20,184,166,0.3)',
  ['--c1-hover-color' as string]: 'rgba(20,184,166,0.1)',
  
  // Input Styling
  ['--c1-input-background' as string]: 'rgba(255,255,255,0.95)',
  ['--c1-input-text-color' as string]: '#0f172a',
  ['--c1-input-border-color' as string]: 'rgba(20,184,166,0.3)',
  ['--c1-input-border-radius' as string]: '12px',
  ['--c1-input-padding' as string]: '12px 16px',
  ['--c1-input-font-size' as string]: '14px',
  ['--c1-input-shadow' as string]: '0 2px 8px rgba(0,0,0,0.1)',
  
  // Message Bubbles
  ['--c1-user-message-bg' as string]: 'rgba(20,184,166,0.2)',
  ['--c1-user-message-color' as string]: '#ffffff',
  ['--c1-assistant-message-bg' as string]: 'rgba(255,255,255,0.05)',
  ['--c1-assistant-message-color' as string]: '#ffffff',
  ['--c1-message-border-radius' as string]: '12px',
  ['--c1-message-padding' as string]: '12px 16px',
  ['--c1-message-max-width' as string]: '80%',
  ['--c1-message-spacing' as string]: '12px',
  
  // Typography
  ['--c1-font-family' as string]: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
  ['--c1-font-size' as string]: '14px',
  ['--c1-line-height' as string]: '1.5',
  ['--c1-heading-font-family' as string]: 'Poppins, sans-serif',
  
  // Buttons
  ['--c1-button-bg' as string]: 'linear-gradient(90deg, #14b8a6 0%, #0d9488 100%)',
  ['--c1-button-color' as string]: '#ffffff',
  ['--c1-button-border-radius' as string]: '8px',
  ['--c1-button-padding' as string]: '8px 16px',
  ['--c1-button-hover-shadow' as string]: '0 4px 12px rgba(20,184,166,0.4)',
  
  // Scrollbar
  ['--c1-scrollbar-width' as string]: '8px',
  ['--c1-scrollbar-track' as string]: 'rgba(20,184,166,0.05)',
  ['--c1-scrollbar-thumb' as string]: 'rgba(20,184,166,0.2)',
  ['--c1-scrollbar-thumb-hover' as string]: 'rgba(20,184,166,0.3)',
  
  // Spacing
  ['--c1-container-padding' as string]: '16px',
  ['--c1-border-radius' as string]: '12px',
};
```

## Theme Presets Code

### Jade Theme
```tsx
const jadeTheme = {
  ['--c1-primary-color' as string]: '#14b8a6',
  background: 'linear-gradient(180deg, #0a2e2e 0%, #0d3d3d 100%)',
};
```

### Carbon Theme
```tsx
const carbonTheme = {
  ['--c1-primary-color' as string]: '#000000',
  ['--c1-background-color' as string]: '#0a0a0a',
  ['--c1-input-background' as string]: '#1a1a1a',
  ['--c1-user-message-bg' as string]: '#2a2a2a',
  ['--c1-assistant-message-bg' as string]: '#1a1a1a',
};
```

### Classic Theme
```tsx
const classicTheme = {
  ['--c1-primary-color' as string]: '#3b82f6',
  ['--c1-background-color' as string]: '#0f172a',
  ['--c1-input-background' as string]: '#1e293b',
  ['--c1-user-message-bg' as string]: 'rgba(59,130,246,0.2)',
  ['--c1-assistant-message-bg' as string]: '#1e293b',
};
```

### Neon Theme
```tsx
const neonTheme = {
  ['--c1-primary-color' as string]: '#facc15',
  ['--c1-background-color' as string]: '#1a1a1a',
  ['--c1-input-background' as string]: '#2a2a2a',
  ['--c1-user-message-bg' as string]: 'rgba(250,204,21,0.2)',
  ['--c1-assistant-message-bg' as string]: '#2a2a2a',
  ['--c1-text-color' as string]: '#facc15',
};
```

## Advanced Theming

### Gradient Backgrounds

```tsx
// Jade gradient
background: 'linear-gradient(180deg, #0a2e2e 0%, #0d3d3d 50%, #0a2525 100%)'

// Blue gradient
background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'

// Purple gradient
background: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)'

// Radial gradient
background: 'radial-gradient(circle at top right, #0d3d3d 0%, #0a2e2e 100%)'
```

### Dark/Light Mode Toggle

```tsx
const lightTheme = {
  ['--c1-primary-color' as string]: '#14b8a6',
  ['--c1-background-color' as string]: '#ffffff',
  ['--c1-text-color' as string]: '#1e293b',
  ['--c1-input-background' as string]: '#f8fafc',
  ['--c1-user-message-bg' as string]: 'rgba(20,184,166,0.1)',
  ['--c1-assistant-message-bg' as string]: '#f1f5f9',
};

const darkTheme = {
  ['--c1-primary-color' as string]: '#14b8a6',
  ['--c1-background-color' as string]: '#0d1b1b',
  ['--c1-text-color' as string]: '#ffffff',
  ['--c1-input-background' as string]: 'rgba(255,255,255,0.95)',
  ['--c1-user-message-bg' as string]: 'rgba(20,184,166,0.2)',
  ['--c1-assistant-message-bg' as string]: 'rgba(255,255,255,0.05)',
};

const [isDark, setIsDark] = useState(true);
const theme = isDark ? darkTheme : lightTheme;
```

### Responsive Theming

```tsx
const useResponsiveTheme = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  return {
    ['--c1-font-size' as string]: isMobile ? '13px' : '14px',
    ['--c1-message-max-width' as string]: isMobile ? '90%' : '80%',
    ['--c1-container-padding' as string]: isMobile ? '12px' : '16px',
  };
};
```

## Best Practices

### 1. Consistent Color Palette
```tsx
// ✅ Good - Consistent teal theme
primary: '#14b8a6'
hover: '#0d9488'
light: '#5eead4'
dark: '#0f766e'

// ❌ Avoid - Mixed colors
primary: '#14b8a6'
hover: '#3b82f6'  // Different hue
```

### 2. Sufficient Contrast
```tsx
// ✅ Good - High contrast
background: '#0d1b1b'
text: '#ffffff'  // WCAG AAA compliant

// ❌ Avoid - Low contrast
background: '#0d1b1b'
text: '#1a2a2a'  // Hard to read
```

### 3. Consistent Spacing
```tsx
// ✅ Good - 4px/8px grid
padding: '12px 16px'  // 12 = 3×4, 16 = 4×4
borderRadius: '12px'
spacing: '12px'

// ❌ Avoid - Random values
padding: '13px 17px'
borderRadius: '11px'
```

### 4. Theme Testing
```tsx
// Test your theme with:
- Different screen sizes
- Light and dark modes
- Various message lengths
- Multiple browsers
- Accessibility tools
```

## Your Implementation ✅

You're using the **Jade theme** with:
- Teal primary color (#14b8a6)
- Dark gradient background
- High contrast text
- Consistent spacing
- Professional appearance

This is production-ready and follows Thesys best practices! 🎨

## Quick Reference

**Change Theme:**
```tsx
// Update primary color
['--c1-primary-color' as string]: '#YOUR_COLOR'

// Update background
background: 'linear-gradient(180deg, #START 0%, #END 100%)'
```

**Test in Playground:**
1. Go to `console.thesys.dev/playground`
2. Click "Customization" tab
3. Select theme preset
4. Copy CSS variables
5. Apply to your app

Your Jade theme implementation is perfect! 🚀
