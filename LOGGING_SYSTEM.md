# Committee Logging System

A comprehensive logging system for tracking all committee actions and events.

## Features

### Log Categories

The system categorizes all actions with color-coded LED indicators:

- 🔴 **Destructive** (Red) - Deletions and removals
  - Speaker removed
  - Member removed
  - Draft deleted
  - Session ended

- 🟢 **Addition** (Green) - New items and creations
  - Speaker added
  - Member added
  - Draft created
  - Session started

- 🟡 **Info** (Yellow) - Configuration and updates
  - Agenda changes
  - Roll call updates
  - Timing configuration

- ⚪ **Standard** (Gray) - Regular actions
  - Speaker reordered
  - Speaker yield
  - Member renamed

### Tracked Actions

The system logs the following committee actions:

#### Session Management
- Session start with committee name and member count
- Session end

#### Members
- Member added (predefined or custom)
- Member removed
- Member renamed

#### Speakers
- Speaker added to list
- Speaker removed from list
- Speaker list reordered
- Time yielded from one speaker to another

#### Agenda & Roll Call
- Agenda changes (with old and new values)
- Attendance updates (Present, Present & Voting, Absent)

#### Timing
- Speaking time configuration changes

#### Drafts
- Draft created (with type: Crisis Note, Working Paper, etc.)
- Draft deleted

## Usage

### Viewing Logs

Navigate to the **Logs** page from the sidebar to view all committee logs.

#### Features:
- **Date Grouping**: Logs are grouped by date (Today, Yesterday, or full date)
- **Search**: Search by action type, title, or description
- **Filter by Category**: Click on any stat card to filter by category
- **Time Display**: Each log shows the exact time it occurred
- **Color-Coded LEDs**: Visual indicators for quick identification

### Statistics Dashboard

The logs page displays real-time statistics:
- Total number of logs
- Count by category (Additions, Destructive, Info, Standard)
- Interactive filtering by clicking stat cards

### Clearing Logs

Use the "Clear All Logs" button to remove all logs. This action requires confirmation.

## Technical Details

### Storage

Logs are stored in the browser's `localStorage` under the key `committee_logs`. This means:
- Logs persist across page refreshes
- Logs are local to each browser/device
- No server storage required

### Data Structure

Each log entry contains:
```typescript
{
  id: string                    // Unique identifier
  timestamp: Date              // When the action occurred
  actionType: LogActionType    // Type of action
  category: LogCategory        // Category for color coding
  title: string                // Short description
  description: string          // Detailed information
  metadata?: Record<string, any> // Additional context
}
```

### Integration

Logging is automatically integrated into:
- `app/page.tsx` - Home page (member operations)
- `app/speaker-list/page.tsx` - Speaker list (speakers, agenda, timing, roll call)
- `app/drafts/page.tsx` - Drafts page (draft creation/deletion)

### Logging Functions

The system provides helper functions in `lib/logging.ts`:

```typescript
// Session
logSessionStart(committeeName, memberCount)
logSessionEnd(committeeName)

// Members
logMemberAdded(memberName, memberType)
logMemberRemoved(memberName)
logMemberRenamed(oldName, newName)

// Speakers
logSpeakerAdded(speakerName)
logSpeakerRemoved(speakerName)
logSpeakerReordered()
logSpeakerYield(fromSpeaker, toSpeaker, timeRemaining)

// Configuration
logAgendaChange(oldAgenda, newAgenda)
logRollCallUpdate(memberName, oldStatus, newStatus)
logTimingConfig(minutes, seconds)

// Drafts
logDraftCreated(draftName, draftType)
logDraftDeleted(draftName, draftType)
```

## Future Enhancements

Possible improvements:
- Export logs to CSV/PDF
- Log filtering by date range
- Log search with advanced queries
- Server-side storage for persistence across devices
- Audit trail for compliance
- Undo/redo functionality based on logs
