# Overriding C1 Styles with CSS - Complete Guide

## Overview

Thesys C1 components can be fully customized using CSS. This guide covers all methods for styling C1Chat.

## Method 1: CSS Variables (Recommended)

### Basic Usage

Apply CSS variables to the parent container:

```tsx
<div style={{
  ['--c1-primary-color' as string]: '#14b8a6',
  ['--c1-background-color' as string]: '#0d1b1b',
  ['--c1-text-color' as string]: '#ffffff',
}}>
  <C1Chat />
</div>
```

### Available CSS Variables

#### Colors
```css
--c1-primary-color: #14b8a6;           /* Main accent color */
--c1-background-color: #0d1b1b;        /* Chat background */
--c1-text-color: #ffffff;              /* Text color */
--c1-secondary-color: #64748b;         /* Secondary elements */
--c1-border-color: rgba(255,255,255,0.1); /* Borders */
--c1-hover-color: rgba(255,255,255,0.05); /* Hover states */
```

#### Input Styling
```css
--c1-input-background: rgba(255,255,255,0.95);
--c1-input-text-color: #1a1a1a;
--c1-input-border-color: rgba(255,255,255,0.2);
--c1-input-border-radius: 12px;
--c1-input-padding: 12px 16px;
--c1-input-font-size: 14px;
```

#### Message Bubbles
```css
--c1-user-message-bg: rgba(20,184,166,0.2);
--c1-user-message-color: #ffffff;
--c1-assistant-message-bg: rgba(255,255,255,0.08);
--c1-assistant-message-color: #ffffff;
--c1-message-border-radius: 12px;
--c1-message-padding: 12px 16px;
--c1-message-max-width: 80%;
```

#### Typography
```css
--c1-font-family: 'Inter', sans-serif;
--c1-font-size: 14px;
--c1-line-height: 1.5;
--c1-heading-font-family: 'Poppins', sans-serif;
```

#### Spacing
```css
--c1-message-spacing: 12px;
--c1-container-padding: 16px;
--c1-border-radius: 12px;
```

#### Scrollbar
```css
--c1-scrollbar-width: 8px;
--c1-scrollbar-track: rgba(255,255,255,0.05);
--c1-scrollbar-thumb: rgba(255,255,255,0.2);
--c1-scrollbar-thumb-hover: rgba(255,255,255,0.3);
```

## Method 2: Global CSS (Your Approach)

### In globals.css

```css
/* Target C1Chat with class */
.chat-container.jade-theme {
  /* Override component styles */
}

/* Force overrides with !important */
.chat-container.jade-theme input[type="text"] {
  background: rgba(255, 255, 255, 0.95) !important;
  color: #1a1a1a !important;
  border-radius: 12px !important;
}

/* Style message bubbles */
.chat-container.jade-theme [role="log"] > div {
  border-radius: 12px !important;
  padding: 12px 16px !important;
}

/* Custom scrollbar */
.chat-container.jade-theme ::-webkit-scrollbar {
  width: 8px;
}

.chat-container.jade-theme ::-webkit-scrollbar-thumb {
  background: rgba(20, 184, 166, 0.2);
  border-radius: 4px;
}
```

## Method 3: Inline Styles

### Component Level

```tsx
<C1Chat 
  className="custom-chat"
  // Note: style prop may not be supported
/>
```

### Container Level (Recommended)

```tsx
<div 
  className="chat-wrapper"
  style={{
    background: 'linear-gradient(180deg, #0a2e2e 0%, #0d3d3d 100%)',
    minHeight: '100vh',
  }}
>
  <C1Chat />
</div>
```

## Method 4: CSS Modules

### chat.module.css

```css
.chatContainer {
  --c1-primary-color: #14b8a6;
  --c1-background-color: #0d1b1b;
  background: linear-gradient(180deg, #0a2e2e 0%, #0d3d3d 100%);
}

.chatContainer :global(.c1-input) {
  background: white;
  border-radius: 12px;
}
```

### Usage

```tsx
import styles from './chat.module.css';

<div className={styles.chatContainer}>
  <C1Chat />
</div>
```

## Common Customizations

### 1. Dark Theme

```css
.dark-theme {
  --c1-primary-color: #3b82f6;
  --c1-background-color: #0f172a;
  --c1-text-color: #f1f5f9;
  --c1-input-background: #1e293b;
  --c1-input-text-color: #f1f5f9;
  --c1-user-message-bg: rgba(59, 130, 246, 0.2);
  --c1-assistant-message-bg: rgba(255, 255, 255, 0.05);
}
```

### 2. Light Theme

```css
.light-theme {
  --c1-primary-color: #3b82f6;
  --c1-background-color: #ffffff;
  --c1-text-color: #1e293b;
  --c1-input-background: #f8fafc;
  --c1-input-text-color: #1e293b;
  --c1-user-message-bg: rgba(59, 130, 246, 0.1);
  --c1-assistant-message-bg: #f1f5f9;
}
```

### 3. Jade Theme (Your Implementation)

```css
.jade-theme {
  --c1-primary-color: #14b8a6;
  --c1-background-color: #0d1b1b;
  --c1-text-color: #ffffff;
  --c1-input-background: rgba(255, 255, 255, 0.95);
  --c1-input-text-color: #0f172a;
  --c1-user-message-bg: rgba(20, 184, 166, 0.2);
  --c1-assistant-message-bg: rgba(255, 255, 255, 0.05);
  background: linear-gradient(180deg, #0a2e2e 0%, #0d3d3d 100%);
}
```

### 4. Custom Input Box

```css
.custom-chat input[type="text"],
.custom-chat textarea {
  background: white !important;
  color: #1a1a1a !important;
  border: 2px solid #14b8a6 !important;
  border-radius: 16px !important;
  padding: 14px 18px !important;
  font-size: 15px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

.custom-chat input:focus,
.custom-chat textarea:focus {
  outline: none !important;
  border-color: #0d9488 !important;
  box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.1) !important;
}
```

### 5. Custom Message Bubbles

```css
/* User messages (right side) */
.custom-chat [data-role="user"] {
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%) !important;
  color: white !important;
  border-radius: 18px 18px 4px 18px !important;
  padding: 12px 16px !important;
  margin-left: auto !important;
  max-width: 70% !important;
}

/* Assistant messages (left side) */
.custom-chat [data-role="assistant"] {
  background: rgba(255, 255, 255, 0.08) !important;
  color: #ffffff !important;
  border-radius: 18px 18px 18px 4px !important;
  padding: 12px 16px !important;
  margin-right: auto !important;
  max-width: 70% !important;
}
```

### 6. Custom Send Button

```css
.custom-chat button[type="submit"] {
  background: linear-gradient(90deg, #14b8a6 0%, #0d9488 100%) !important;
  color: white !important;
  border: none !important;
  border-radius: 10px !important;
  padding: 10px 20px !important;
  font-weight: 600 !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
}

.custom-chat button[type="submit"]:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 16px rgba(20, 184, 166, 0.4) !important;
}

.custom-chat button[type="submit"]:active {
  transform: translateY(0) !important;
}
```

## Best Practices

### 1. Use CSS Variables First
```tsx
// ✅ Good - Uses CSS variables
<div style={{ ['--c1-primary-color' as string]: '#14b8a6' }}>
  <C1Chat />
</div>

// ❌ Avoid - Direct styling may not work
<C1Chat style={{ color: '#14b8a6' }} />
```

### 2. Scope Your Styles
```css
/* ✅ Good - Scoped to your chat */
.my-chat-container .c1-input {
  background: white;
}

/* ❌ Avoid - Global, affects all C1 instances */
.c1-input {
  background: white;
}
```

### 3. Use !important Sparingly
```css
/* ✅ Good - Only when necessary */
.chat-container input {
  background: white !important; /* Override component default */
}

/* ❌ Avoid - Overuse makes maintenance hard */
.chat-container * {
  color: white !important;
}
```

### 4. Test Across Themes
```tsx
// Support multiple themes
const themes = {
  jade: { primary: '#14b8a6', bg: '#0d1b1b' },
  carbon: { primary: '#000000', bg: '#0a0a0a' },
  classic: { primary: '#3b82f6', bg: '#0f172a' },
};

<div style={{
  ['--c1-primary-color' as string]: themes.jade.primary,
  ['--c1-background-color' as string]: themes.jade.bg,
}}>
  <C1Chat />
</div>
```

## Debugging Tips

### 1. Inspect Element
```
1. Right-click on C1Chat element
2. Select "Inspect" or "Inspect Element"
3. View applied styles in DevTools
4. Test CSS changes live
```

### 2. Check Specificity
```css
/* Low specificity - may not work */
.chat { color: white; }

/* Higher specificity - better */
.chat-container .c1-chat { color: white; }

/* Highest - use when needed */
.chat-container .c1-chat input[type="text"] { color: white !important; }
```

### 3. Verify CSS Variables
```javascript
// In browser console
const el = document.querySelector('.chat-container');
const styles = getComputedStyle(el);
console.log(styles.getPropertyValue('--c1-primary-color'));
```

## Your Current Implementation

### What You're Using

**CSS Variables:**
```tsx
['--c1-primary-color' as string]: '#14b8a6',
['--c1-background-color' as string]: '#0d1b1b',
['--c1-text-color' as string]: '#ffffff',
```

**Global CSS:**
```css
.chat-container.jade-theme input[type="text"] {
  background: rgba(255, 255, 255, 0.95) !important;
}
```

**Gradient Background:**
```tsx
background: 'linear-gradient(180deg, #0a2e2e 0%, #0d3d3d 100%)'
```

This is the **recommended approach** - combining CSS variables with targeted global CSS overrides! ✅

## Summary

**Priority Order:**
1. CSS Variables (easiest, most maintainable)
2. Global CSS with class scoping
3. !important overrides (when needed)
4. Inline styles on container

**Your implementation follows Thesys best practices perfectly!** 🎉
