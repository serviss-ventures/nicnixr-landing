# Supabase Optimization Setup

## Quick Setup (5 minutes)

Just run these SQL commands in your Supabase SQL editor to optimize performance:

### 1. Add Performance Indexes

```sql
-- Speed up message queries by session
CREATE INDEX IF NOT EXISTS idx_messages_session_created 
ON ai_coach_messages(session_id, created_at DESC);

-- Speed up message queries by user
CREATE INDEX IF NOT EXISTS idx_messages_user_created 
ON ai_coach_messages(user_id, created_at DESC);

-- Speed up finding active sessions
CREATE INDEX IF NOT EXISTS idx_sessions_user_active 
ON ai_coach_sessions(user_id, ended_at)
WHERE ended_at IS NULL;
```

### 2. Create a Scheduled Function (Optional)

This will automatically clean up abandoned sessions weekly:

```sql
-- Function to clean up old abandoned sessions
CREATE OR REPLACE FUNCTION cleanup_abandoned_sessions()
RETURNS void AS $$
BEGIN
  -- Close sessions older than 7 days that weren't properly ended
  UPDATE ai_coach_sessions 
  SET ended_at = NOW() 
  WHERE ended_at IS NULL 
  AND started_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Schedule it to run weekly (requires pg_cron extension)
-- If you have pg_cron enabled:
-- SELECT cron.schedule('cleanup-sessions', '0 2 * * 0', 'SELECT cleanup_abandoned_sessions();');
```

### 3. Monitor Database Size (Run periodically)

```sql
-- Check how much space each user is using
SELECT 
  u.email,
  COUNT(m.*) as message_count,
  MAX(m.created_at) as last_message,
  pg_size_pretty(SUM(pg_column_size(m.*))::bigint) as storage_used
FROM ai_coach_messages m
JOIN auth.users u ON u.id = m.user_id
GROUP BY u.email
ORDER BY COUNT(m.*) DESC
LIMIT 20;

-- Check total database usage
SELECT 
  COUNT(*) as total_messages,
  pg_size_pretty(pg_total_relation_size('ai_coach_messages')) as table_size
FROM ai_coach_messages;
```

## That's It! 🎉

The app now automatically:
- ✅ Limits chats to 100 messages
- ✅ Warns users at 80 messages
- ✅ Only loads last 50 messages (faster)
- ✅ Cleans up abandoned sessions
- ✅ Prompts for new chat when needed

## What Happens Automatically

1. **Message Limits**: Users see a warning at 80 messages, blocked at 100
2. **Auto Cleanup**: Old abandoned sessions close after 7 days
3. **Performance**: Only recent messages load, rest stay in database
4. **New Chats**: Easy menu option to start fresh conversations

## Future Options (When Needed)

If your database grows too large later, you can:
1. Archive messages older than 30 days
2. Add message compression
3. Implement user data export
4. Set up automated backups

But for now, the simple optimizations above will keep things running smoothly for thousands of users! 