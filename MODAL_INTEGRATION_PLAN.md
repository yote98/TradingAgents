# Modal Agent Selection - Implementation Plan

## Why Modal is Best for Discord

✅ **Separation of Concerns**: Chat UI vs Agent Selection
✅ **Easy Discord Integration**: Just add to the modal's coach section
✅ **No Routing Issues**: Modal overlays, no URL changes needed
✅ **Scalable**: Easy to add more agent sources later
✅ **Better UX**: Clear, focused action to select agent

## Implementation Steps

### Phase 1: Basic Modal (Week 1)
1. Create modal component in c1-template
2. Add button to chat header
3. Display static list of analysts
4. Handle agent selection
5. Close modal and start chat

### Phase 2: Discord Integration (Week 2)
1. Add Discord API endpoint to fetch coaches
2. Display coaches in "External Coaches" section
3. Show loading state while fetching
4. Handle Discord unavailable gracefully
5. Cache coach data for performance

### Phase 3: Enhanced Features (Week 3)
1. Add search/filter in modal
2. Show agent status (online/offline)
3. Display recent activity
4. Add favorites/pinning
5. Keyboard shortcuts (Cmd+K to open)

## Code Structure

```
c1-template/src/
├── components/
│   ├── AgentModal.tsx          # Main modal component
│   ├── AgentCard.tsx            # Individual agent card
│   ├── AgentGrid.tsx            # Grid layout
│   └── AgentSearch.tsx          # Search/filter
├── hooks/
│   ├── useAgentModal.ts         # Modal state management
│   └── useDiscordCoaches.ts     # Fetch Discord data
├── lib/
│   └── discord-api.ts           # Discord API calls
└── types/
    └── agents.ts                # Agent type definitions
```

## Discord Integration Details

### Fetching Coaches
```typescript
// lib/discord-api.ts
export async function fetchDiscordCoaches() {
  try {
    const response = await fetch('/api/discord/coaches');
    const coaches = await response.json();
    return coaches;
  } catch (error) {
    console.error('Discord unavailable:', error);
    return []; // Graceful fallback
  }
}
```

### Modal Component
```typescript
// components/AgentModal.tsx
export function AgentModal({ isOpen, onClose, onSelect }) {
  const { data: discordCoaches, loading } = useDiscordCoaches();
  
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Section title="Internal Analysts">
        {INTERNAL_ANALYSTS.map(agent => (
          <AgentCard key={agent.id} agent={agent} onSelect={onSelect} />
        ))}
      </Section>
      
      <Section title="External Coaches">
        {loading ? (
          <LoadingSpinner />
        ) : discordCoaches.length > 0 ? (
          discordCoaches.map(coach => (
            <AgentCard key={coach.id} agent={coach} onSelect={onSelect} />
          ))
        ) : (
          <EmptyState message="Discord coaches unavailable" />
        )}
      </Section>
    </Modal>
  );
}
```

### Agent Selection Flow
```
User clicks "Select Agent" button
  ↓
Modal opens
  ↓
Fetch Discord coaches (async)
  ↓
Display all agents (internal + Discord)
  ↓
User clicks an agent card
  ↓
Modal closes
  ↓
Chat starts with selected agent
```

## Benefits Over Other Approaches

### vs Sidebar Approach
- ❌ Sidebar: Takes permanent screen space
- ✅ Modal: Only appears when needed

### vs Dropdown Approach
- ❌ Dropdown: Limited space for descriptions
- ✅ Modal: Full cards with icons, descriptions, status

### vs Separate Page
- ❌ Separate Page: Requires navigation, breaks flow
- ✅ Modal: Stays in context, smooth transition

## Discord-Specific Advantages

1. **Independent Loading**: Discord can load async without blocking UI
2. **Error Handling**: If Discord fails, internal analysts still work
3. **Caching**: Can cache Discord data, refresh in background
4. **Status Indicators**: Easy to show which coaches are active
5. **Rich Metadata**: Can display coach stats, recent posts, etc.

## Migration Path

### Current State
- Landing page with "Launch AI" button
- Chat interface (basic)

### Step 1: Add Modal
- Keep existing chat
- Add "Select Agent" button
- Implement modal with static agents

### Step 2: Connect Discord
- Add Discord API integration
- Fetch coaches dynamically
- Display in modal's coach section

### Step 3: Enhance
- Add search, filters, favorites
- Show agent status and activity
- Improve performance with caching

## No Breaking Changes

✅ Existing chat functionality stays the same
✅ Modal is additive (doesn't replace anything)
✅ Discord is optional (graceful degradation)
✅ Can deploy incrementally

## Timeline

**Week 1**: Basic modal with static agents
**Week 2**: Discord integration
**Week 3**: Polish and enhancements
**Week 4**: Testing and deployment

## Next Steps

1. Review and approve this plan
2. Start with basic modal implementation
3. Test with static data first
4. Add Discord integration
5. Deploy and iterate
