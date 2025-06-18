-- Create error_logs table for crash reports and errors
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  platform VARCHAR(50),
  app_version VARCHAR(20),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  device_model VARCHAR(100),
  os_version VARCHAR(50),
  available_memory VARCHAR(50),
  severity VARCHAR(20) DEFAULT 'error',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create api_logs table for request monitoring
CREATE TABLE IF NOT EXISTS api_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  status_code INTEGER,
  response_time INTEGER, -- in milliseconds
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX idx_error_logs_user_id ON error_logs(user_id);
CREATE INDEX idx_error_logs_platform ON error_logs(platform);
CREATE INDEX idx_api_logs_created_at ON api_logs(created_at DESC);
CREATE INDEX idx_api_logs_endpoint ON api_logs(endpoint);

-- Add last_seen_at to users table if not exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;

-- Create RLS policies
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_logs ENABLE ROW LEVEL SECURITY;

-- Admin can view all logs
CREATE POLICY "Admin can view all error logs" ON error_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admin can view all API logs" ON api_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Service role can insert logs
CREATE POLICY "Service role can insert error logs" ON error_logs
  FOR INSERT TO service_role
  USING (true);

CREATE POLICY "Service role can insert API logs" ON api_logs
  FOR INSERT TO service_role
  USING (true); 