-- API Metrics Table
-- Stores metrics for all API endpoint calls

CREATE TABLE IF NOT EXISTS api_metrics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  response_time INTEGER NOT NULL, -- milliseconds
  status_code INTEGER NOT NULL,
  error_message TEXT,
  user_id UUID REFERENCES auth.users(id),
  ip_address TEXT,
  user_agent TEXT,
  request_size INTEGER,
  response_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_api_metrics_timestamp ON api_metrics(timestamp DESC);
CREATE INDEX idx_api_metrics_endpoint ON api_metrics(endpoint);
CREATE INDEX idx_api_metrics_user_id ON api_metrics(user_id);
CREATE INDEX idx_api_metrics_status_code ON api_metrics(status_code);
CREATE INDEX idx_api_metrics_endpoint_timestamp ON api_metrics(endpoint, timestamp DESC);

-- Composite index for common queries
CREATE INDEX idx_api_metrics_endpoint_method_timestamp 
  ON api_metrics(endpoint, method, timestamp DESC);

-- Enable Row Level Security
ALTER TABLE api_metrics ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can insert metrics
CREATE POLICY "Service role can insert metrics" ON api_metrics
  FOR INSERT
  TO service_role
  USING (true);

-- Policy: Authenticated admin users can view metrics
CREATE POLICY "Admin users can view metrics" ON api_metrics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Function to clean up old metrics (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_api_metrics()
RETURNS void AS $$
BEGIN
  DELETE FROM api_metrics
  WHERE timestamp < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup to run daily (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-api-metrics', '0 2 * * *', 'SELECT cleanup_old_api_metrics();'); 