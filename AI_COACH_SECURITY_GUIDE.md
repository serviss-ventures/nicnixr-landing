# AI Coach Security & Privacy Guide 🔒

## Overview
This guide outlines how the AI Recovery Coach securely accesses user data to provide personalized support without compromising privacy or security.

## 🛡️ Security Measures Implemented

### 1. **Input Validation**
- UUID format validation for all user IDs
- Prevents SQL injection and unauthorized data access
- Rejects malformed requests immediately

### 2. **Data Minimization**
Only fetches essential data:
- Basic profile: username, days_clean, substance_type
- Aggregated journal insights (not raw entries)
- Achievement counts (not detailed progress)

### 3. **No Cross-User Data Access**
- Each query is strictly filtered by user_id
- No bulk queries or joins that could expose other users
- Service role key only used server-side

### 4. **Aggregated Insights Only**
Instead of raw journal entries, we provide:
- Mood patterns (e.g., "Generally positive mood")
- Craving frequency (e.g., "Dealing with some cravings")
- Sleep quality trends
- Never specific text entries or personal notes

### 5. **Context Building**
The AI receives structured context like:
```
User Context:
- Name: BraveWarrior
- 7 days clean from nicotine
- Approaching one week milestone

Recent patterns (last 7 days):
- Generally positive mood
- Dealing with some cravings (3 days)
- Sleep has been challenging
- Has unlocked 5 recent achievements
```

## 🗄️ Database Security Recommendations

### 1. **Row Level Security (RLS)**
Ensure these policies are active on all tables:

```sql
-- Users table: Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Journal entries: Strict user isolation
CREATE POLICY "Users can manage own journal entries" ON journal_entries
  FOR ALL USING (auth.uid() = user_id);

-- AI coach messages: User-specific access only
CREATE POLICY "Users can view own AI messages" ON ai_coach_messages
  FOR SELECT USING (auth.uid() = user_id);

-- Achievements: Read own achievements only
CREATE POLICY "Users can view own achievements" ON achievements
  FOR SELECT USING (auth.uid() = user_id);
```

### 2. **API Security**
- Use service role key ONLY on server-side
- Never expose service role key to client
- Implement rate limiting on AI coach endpoint

### 3. **Data Retention**
```sql
-- Auto-cleanup old AI coach sessions (30 days)
CREATE OR REPLACE FUNCTION cleanup_old_ai_sessions()
RETURNS void AS $$
BEGIN
  UPDATE ai_coach_sessions 
  SET ended_at = NOW()
  WHERE ended_at IS NULL 
  AND started_at < NOW() - INTERVAL '30 days';
  
  -- Archive messages older than 90 days
  INSERT INTO ai_coach_messages_archive
  SELECT * FROM ai_coach_messages
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  DELETE FROM ai_coach_messages
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Schedule weekly cleanup
SELECT cron.schedule('cleanup-ai-sessions', '0 2 * * 0', 'SELECT cleanup_old_ai_sessions()');
```

### 4. **Audit Logging**
```sql
-- Create audit log for AI coach access
CREATE TABLE ai_coach_audit_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  session_id UUID,
  action TEXT,
  risk_level TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Log high-risk interactions
CREATE OR REPLACE FUNCTION log_high_risk_interaction()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.risk_level IN ('high', 'critical') THEN
    INSERT INTO ai_coach_audit_log (user_id, session_id, action, risk_level)
    VALUES (NEW.user_id, NEW.session_id, 'high_risk_message', NEW.risk_level);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ai_message_risk_audit
AFTER INSERT ON ai_coach_messages
FOR EACH ROW EXECUTE FUNCTION log_high_risk_interaction();
```

## 🔐 Best Practices

### For Developers:
1. **Never log sensitive data** - Only log IDs, timestamps, and aggregated metrics
2. **Use parameterized queries** - Never concatenate user input into SQL
3. **Validate all inputs** - Check data types and formats before processing
4. **Limit data exposure** - Only send what the AI needs to know
5. **Regular security audits** - Review access logs monthly

### For the AI Context:
1. **No PII in prompts** - Use usernames, not real names
2. **Aggregate patterns** - "3 days of cravings" not specific entries
3. **Time-based context** - Focus on recent data (last 7 days)
4. **Milestone-based insights** - Group by recovery stages

## 📊 What the AI Sees vs What's Stored

### Stored in Database:
- Full journal entries with detailed text
- Exact timestamps and locations
- Complete achievement history
- All message history

### What AI Receives:
- "Generally positive mood last week"
- "7 days clean, approaching milestone"
- "Has recent achievements"
- "Dealing with some cravings"

## 🚨 Security Monitoring

### Real-time Alerts for:
- Multiple failed authentication attempts
- Unusual data access patterns
- High-risk keywords in messages
- Bulk data requests

### Monthly Reviews:
- AI conversation logs (anonymized)
- Access patterns by user cohort
- Security policy effectiveness
- Data retention compliance

## 🔄 Future Enhancements

1. **Differential Privacy**: Add noise to aggregated data
2. **Homomorphic Encryption**: Process encrypted journal data
3. **Federated Learning**: Train models without centralizing data
4. **Zero-Knowledge Proofs**: Verify milestones without revealing data

## 📝 Summary

The AI Coach provides personalized support by:
- ✅ Using aggregated insights, not raw data
- ✅ Validating all inputs to prevent attacks
- ✅ Implementing strict user isolation
- ✅ Minimizing data exposure
- ✅ Following privacy-by-design principles

This approach gives users a deeply personal experience while maintaining the highest standards of privacy and security. 