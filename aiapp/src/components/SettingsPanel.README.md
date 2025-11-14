# SettingsPanel Component

A comprehensive settings panel for managing browser notification preferences in the Coach Dashboard.

## Features

### Permission Management
- Displays current notification permission status (Granted/Denied/Not Set)
- Request permission button for first-time users
- Helpful instructions for users who have denied permissions

### Global Controls
- Master toggle to enable/disable all notifications
- Automatically disabled when browser permission is not granted

### Per-Coach Settings
- Individual toggles for each coach type:
  - Day Trading Coach (coach_d)
  - Intraday Analysis Coach (coach_i)
  - Sentiment Coach (coach_s)
  - News & Events Coach (coach_n)

### Notification Throttling
- Adjustable interval slider (1-30 minutes)
- Prevents notification spam from the same coach
- Visual feedback showing current interval in minutes and seconds

### Additional Options
- Sound toggle for notification audio
- Test notification button to verify setup
- Auto-save with visual feedback

## Usage

```tsx
import SettingsPanel from '@/components/SettingsPanel';

function Dashboard() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setSettingsOpen(true)}>
        Settings
      </button>
      
      <SettingsPanel 
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  );
}
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `isOpen` | `boolean` | Controls panel visibility |
| `onClose` | `() => void` | Callback when panel should close |

## Integration

The component integrates with:
- **NotificationManager**: Loads and saves preferences via `getNotificationManager()`
- **localStorage**: Persists settings across sessions
- **Browser Notification API**: Requests permissions and shows test notifications

## Styling

- Matches dashboard design with slate color scheme
- Slide-in panel from the right side
- Backdrop overlay for focus
- Responsive design for mobile and desktop
- Smooth transitions and animations

## Accessibility

- Proper ARIA labels for buttons
- Keyboard navigation support
- Clear visual feedback for all interactions
- Disabled states when permissions not granted

## Requirements Satisfied

- ✅ 5.1: Global notification toggle
- ✅ 5.1: Per-coach notification toggles
- ✅ 5.1: Notification interval slider
- ✅ 5.4: Settings persistence via localStorage
- ✅ 5.5: Test notification button
- ✅ 5.5: Permission status display
