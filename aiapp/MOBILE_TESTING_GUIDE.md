# Mobile Testing Guide for Twitter Feed Panel

This guide outlines how to test the mobile responsive features of the Twitter Feed Panel.

## Testing Checklist

### 1. Responsive Layout Testing

#### Desktop (≥1024px)
- [ ] Full two-column layout for sentiment arguments
- [ ] All text labels visible (e.g., "Auto-refresh", "Updated:")
- [ ] Standard spacing and padding
- [ ] Hover effects work on interactive elements

#### Tablet (768px - 1023px)
- [ ] Two-column layout maintained
- [ ] Slightly reduced spacing
- [ ] Touch targets adequate (44x44px minimum)

#### Mobile (< 768px)
- [ ] Single column layout
- [ ] Compact spacing (reduced padding)
- [ ] Non-essential labels hidden (e.g., "Auto-refresh" text)
- [ ] Filter input full width
- [ ] Tweet count shows abbreviated format
- [ ] Sentiment gauge displays in single column

### 2. Touch Gesture Testing

#### Swipe-to-Dismiss (TweetCard)
1. Open Twitter feed on mobile device
2. Swipe right on a tweet card
3. **Expected**: Card should move with finger
4. **Expected**: If swipe > 100px, card should fade out and reset
5. **Expected**: If swipe < 100px, card should snap back

#### Pull-to-Refresh (TwitterFeedPanel)
1. Scroll to top of feed
2. Pull down on the feed
3. **Expected**: Refresh indicator appears
4. **Expected**: When pulled > 60px, refresh triggers
5. **Expected**: Feed updates with new data
6. **Expected**: Indicator disappears after refresh

### 3. Touch Target Size Testing

All interactive elements should have minimum 44x44px touch targets on mobile:

- [ ] Refresh button
- [ ] Settings button
- [ ] Clear filter button
- [ ] Account add button
- [ ] Account remove buttons
- [ ] Sentiment gauge expand/collapse buttons
- [ ] Ticker badges in tweets
- [ ] "View Tweet" links

### 4. Performance Testing

#### Mobile Network Simulation
1. Open Chrome DevTools
2. Go to Network tab
3. Set throttling to "Slow 3G"
4. Load Twitter feed
5. **Expected**: Images lazy load as you scroll
6. **Expected**: Feed remains responsive
7. **Expected**: No layout shifts during image loading

#### Scroll Performance
1. Load feed with 100+ tweets
2. Scroll rapidly up and down
3. **Expected**: Smooth scrolling (60fps)
4. **Expected**: No jank or stuttering
5. **Expected**: Virtual scrolling limits rendered items

#### Memory Usage
1. Open feed and let it load
2. Check browser memory usage
3. Scroll through all tweets
4. **Expected**: Memory usage stays reasonable (< 100MB)
5. **Expected**: No memory leaks after closing

### 5. Device-Specific Testing

#### iOS Safari
- [ ] Pull-to-refresh works correctly
- [ ] Swipe gestures don't conflict with browser navigation
- [ ] Touch targets are adequate
- [ ] Fonts render correctly
- [ ] Animations are smooth
- [ ] Modal overlays work properly

#### Android Chrome
- [ ] Pull-to-refresh works correctly
- [ ] Swipe gestures work smoothly
- [ ] Touch targets are adequate
- [ ] Fonts render correctly
- [ ] Animations are smooth
- [ ] Modal overlays work properly

### 6. Screen Size Testing

Test on various screen sizes:
- [ ] iPhone SE (375x667)
- [ ] iPhone 12/13 (390x844)
- [ ] iPhone 14 Pro Max (430x932)
- [ ] Samsung Galaxy S21 (360x800)
- [ ] iPad Mini (768x1024)
- [ ] iPad Pro (1024x1366)

### 7. Orientation Testing

#### Portrait Mode
- [ ] All content fits without horizontal scroll
- [ ] Touch targets are adequate
- [ ] Text is readable
- [ ] Images scale appropriately

#### Landscape Mode
- [ ] Layout adjusts appropriately
- [ ] Content remains accessible
- [ ] No awkward spacing
- [ ] Touch targets remain adequate

### 8. Accessibility Testing

#### Touch Accessibility
- [ ] All interactive elements have aria-labels
- [ ] Touch targets meet WCAG 2.1 guidelines (44x44px)
- [ ] Focus indicators visible on keyboard navigation
- [ ] Screen reader announces interactive elements

#### Reduced Motion
1. Enable "Reduce Motion" in device settings
2. Load Twitter feed
3. **Expected**: Animations are minimal or disabled
4. **Expected**: Transitions are instant or very short

### 9. Network Conditions Testing

#### Offline Mode
1. Load feed with data
2. Turn off network
3. **Expected**: Cached data still displays
4. **Expected**: Error message shows for refresh attempts
5. **Expected**: Manual refresh button available

#### Slow Connection
1. Simulate slow 3G
2. Load feed
3. **Expected**: Loading skeletons show
4. **Expected**: Images load progressively
5. **Expected**: Feed remains usable during loading

### 10. Edge Cases

#### Empty States
- [ ] No tweets found message displays correctly
- [ ] Empty state is centered and readable
- [ ] Icon and text are appropriately sized

#### Long Content
- [ ] Long tweet text wraps correctly
- [ ] Long account names truncate with ellipsis
- [ ] Many tickers display without breaking layout

#### Many Items
- [ ] 100+ tweets load without performance issues
- [ ] "Showing first 100" message displays
- [ ] Scroll performance remains smooth

## Manual Testing Tools

### Browser DevTools
1. **Chrome DevTools**
   - Device toolbar (Cmd/Ctrl + Shift + M)
   - Network throttling
   - Performance profiling
   - Mobile device emulation

2. **Firefox Responsive Design Mode**
   - Cmd/Ctrl + Shift + M
   - Touch simulation
   - Device presets

### Physical Device Testing
- Use actual iOS and Android devices
- Test on different screen sizes
- Test with real network conditions
- Test with actual touch gestures

### Testing Checklist Summary

Before considering mobile testing complete:
- [ ] All responsive breakpoints tested
- [ ] Touch gestures work on real devices
- [ ] Performance is acceptable on slow connections
- [ ] Touch targets meet accessibility guidelines
- [ ] Layout works in both orientations
- [ ] No horizontal scrolling on any screen size
- [ ] Images lazy load correctly
- [ ] Animations are smooth
- [ ] Text is readable at all sizes
- [ ] All interactive elements are accessible

## Known Limitations

1. **Pull-to-refresh**: May conflict with browser's native pull-to-refresh on some devices
2. **Swipe-to-dismiss**: Only works on touch devices (not mouse drag)
3. **Virtual scrolling**: Limited to 100 tweets for performance
4. **Image optimization**: Depends on source image quality

## Reporting Issues

When reporting mobile issues, include:
- Device model and OS version
- Browser and version
- Screen size and orientation
- Network conditions
- Steps to reproduce
- Screenshots or screen recording
- Console errors (if any)
