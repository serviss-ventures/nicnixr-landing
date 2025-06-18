# AI Coach Database Optimization Strategy

## Overview
Smart strategies to prevent database bloat while maintaining great user experience and conversation history.

## Current Architecture
- **ai_coach_sessions**: Stores session metadata
- **ai_coach_messages**: Stores all messages (can grow large)
- One active session per user at a time

## Storage Optimization Strategies

### 1. Message Archival System
```sql
-- Create archive table for older messages
CREATE TABLE ai_coach_messages_archive (
  LIKE ai_coach_messages INCLUDING ALL
);

-- Move messages older than 30 days to archive
INSERT INTO ai_coach_messages_archive 
SELECT * FROM ai_coach_messages 
WHERE created_at < NOW() - INTERVAL '30 days';

DELETE FROM ai_coach_messages 
WHERE created_at < NOW() - INTERVAL '30 days';
```

### 2. Message Compression
```typescript
// Compress older conversations
interface CompressedSession {
  id: string;
  user_id: string;
  summary: string;
  key_topics: string[];
  message_count: number;
  created_at: string;
}

// Store compressed summaries instead of full history
async function compressOldSessions() {
  const oldSessions = await getSessionsOlderThan(7); // 7 days
  
  for (const session of oldSessions) {
    const messages = await getSessionMessages(session.id);
    const summary = await generateSummary(messages);
    
    await saveCompressedSession({
      ...session,
      summary,
      key_topics: extractTopics(messages),
      message_count: messages.length
    });
    
    // Delete original messages
    await deleteSessionMessages(session.id);
  }
}
```

### 3. Smart Message Limits
```typescript
// Limit messages per session
const MAX_MESSAGES_PER_SESSION = 100;

// Auto-create new session when limit reached
if (currentSessionMessageCount >= MAX_MESSAGES_PER_SESSION) {
  // Save summary of current session
  await summarizeAndArchiveSession(currentSession);
  
  // Start fresh session with context
  const newSession = await startSessionWithContext(userId, summary);
}
```

### 4. Database Indexes
```sql
-- Optimize query performance
CREATE INDEX idx_messages_session_created 
ON ai_coach_messages(session_id, created_at DESC);

CREATE INDEX idx_messages_user_created 
ON ai_coach_messages(user_id, created_at DESC);

CREATE INDEX idx_sessions_user_active 
ON ai_coach_sessions(user_id, ended_at)
WHERE ended_at IS NULL;
```

### 5. Pagination & Lazy Loading
```typescript
// Don't load entire history at once
async function loadRecentMessages(sessionId: string, limit = 50) {
  return await supabase
    .from('ai_coach_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(limit);
}

// Load more as user scrolls up
async function loadMoreMessages(sessionId: string, beforeTimestamp: string) {
  return await supabase
    .from('ai_coach_messages')
    .select('*')
    .eq('session_id', sessionId)
    .lt('created_at', beforeTimestamp)
    .order('created_at', { ascending: false })
    .limit(20);
}
```

## Implementation Plan

### Phase 1: Immediate Optimizations
1. **Add Message Limits** (1 hour)
   - Implement 100 message limit per session
   - Auto-create new sessions with context

2. **Add Indexes** (30 min)
   - Create performance indexes
   - Monitor query performance

### Phase 2: Smart Archival (2-3 hours)
1. **Message Summarization**
   - Use AI to summarize old conversations
   - Store summaries instead of full text

2. **Scheduled Cleanup**
   ```typescript
   // Daily cron job
   async function dailyCleanup() {
     // Archive messages older than 30 days
     await archiveOldMessages();
     
     // Compress sessions older than 7 days
     await compressOldSessions();
     
     // Delete archived data older than 90 days
     await deleteOldArchives();
   }
   ```

### Phase 3: Advanced Features (4-6 hours)
1. **Chat History UI**
   - Show session summaries
   - Allow viewing archived chats
   - Search through conversations

2. **Export Feature**
   - Let users download their chat history
   - Then safely delete from database

## Storage Estimates

### Current Approach
- Average message: ~200 bytes
- 50 messages/day × 365 days = 18,250 messages/year
- Storage per user: ~3.65 MB/year

### With Optimization
- Recent messages (30 days): ~300 KB
- Compressed summaries: ~50 KB
- Total per user: ~350 KB (90% reduction!)

## Quick Wins for Now

1. **Simple Session Management**
```typescript
// In AICoachScreen.tsx
const SESSION_MESSAGE_LIMIT = 100;

// Check message count before sending
if (messages.length >= SESSION_MESSAGE_LIMIT) {
  Alert.alert(
    'Start New Conversation?',
    'This chat is getting long. Would you like to start a fresh conversation?',
    [
      { text: 'Continue Here', style: 'cancel' },
      { text: 'Start Fresh', onPress: startNewChat }
    ]
  );
}
```

2. **Cleanup Old Sessions**
```sql
-- Run weekly to clean up abandoned sessions
UPDATE ai_coach_sessions 
SET ended_at = NOW() 
WHERE ended_at IS NULL 
AND started_at < NOW() - INTERVAL '7 days';
```

3. **Monitor Usage**
```sql
-- Check database size
SELECT 
  user_id,
  COUNT(*) as message_count,
  pg_size_pretty(SUM(pg_column_size(message_text))) as storage_used
FROM ai_coach_messages
GROUP BY user_id
ORDER BY message_count DESC;
```

## Best Practices

1. **Set Expectations**
   - Tell users chats are archived after 30 days
   - Provide export option before deletion

2. **Smart Summaries**
   - Keep key insights from each session
   - Reference previous breakthroughs

3. **Performance First**
   - Index frequently queried columns
   - Paginate large result sets
   - Cache recent messages

4. **User Control**
   - Let users delete their own data
   - Provide privacy settings
   - Export functionality

This approach keeps your database lean while preserving the important context and history users need for their recovery journey! 