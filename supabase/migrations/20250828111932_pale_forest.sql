/*
  # Scalability and Performance Tables

  1. New Tables
    - `async_jobs` - For asynchronous processing
    - `user_subscriptions` - Subscription management
    - `usage_quotas` - Usage tracking and limits
    - `system_metrics` - Performance monitoring
    - `system_alerts` - Alert management
    - `user_actions` - User behavior tracking

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for each table
    - Create indexes for performance

  3. Performance
    - Optimized indexes for common queries
    - Partitioning considerations for large tables
*/

-- Async Jobs Table
CREATE TABLE IF NOT EXISTS async_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('analyze-product', 'generate-listing', 'generate-video')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  user_id uuid REFERENCES auth.users(id),
  session_id text NOT NULL,
  input jsonb NOT NULL,
  output jsonb,
  error text,
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  current_step text,
  estimated_duration integer DEFAULT 30,
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User Subscriptions Table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  plan_id text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  current_period_start timestamptz NOT NULL,
  current_period_end timestamptz NOT NULL,
  cancel_at_period_end boolean DEFAULT false,
  trial_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Usage Quotas Table
CREATE TABLE IF NOT EXISTS usage_quotas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  plan_id text NOT NULL,
  period text NOT NULL, -- YYYY-MM format
  listings_used integer DEFAULT 0,
  videos_used integer DEFAULT 0,
  storage_used bigint DEFAULT 0, -- in bytes
  last_reset timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, period)
);

-- System Metrics Table
CREATE TABLE IF NOT EXISTS system_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  value numeric NOT NULL,
  unit text NOT NULL,
  tags jsonb DEFAULT '{}',
  timestamp timestamptz DEFAULT now()
);

-- System Alerts Table
CREATE TABLE IF NOT EXISTS system_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('cost', 'performance', 'error', 'usage')),
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title text NOT NULL,
  description text NOT NULL,
  threshold numeric NOT NULL,
  current_value numeric NOT NULL,
  resolved boolean DEFAULT false,
  resolved_at timestamptz,
  timestamp timestamptz DEFAULT now()
);

-- User Actions Table (for analytics and conversion tracking)
CREATE TABLE IF NOT EXISTS user_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  session_id text,
  action text NOT NULL,
  metadata jsonb DEFAULT '{}',
  timestamp timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE async_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_actions ENABLE ROW LEVEL SECURITY;

-- Policies for async_jobs
CREATE POLICY "Users can view own jobs"
  ON async_jobs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all jobs"
  ON async_jobs FOR ALL
  TO service_role
  USING (true);

-- Policies for user_subscriptions
CREATE POLICY "Users can view own subscription"
  ON user_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions"
  ON user_subscriptions FOR ALL
  TO service_role
  USING (true);

-- Policies for usage_quotas
CREATE POLICY "Users can view own usage"
  ON usage_quotas FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage usage"
  ON usage_quotas FOR ALL
  TO service_role
  USING (true);

-- Policies for system_metrics (admin only)
CREATE POLICY "Service role can manage metrics"
  ON system_metrics FOR ALL
  TO service_role
  USING (true);

-- Policies for system_alerts (admin only)
CREATE POLICY "Service role can manage alerts"
  ON system_alerts FOR ALL
  TO service_role
  USING (true);

-- Policies for user_actions
CREATE POLICY "Users can view own actions"
  ON user_actions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage actions"
  ON user_actions FOR ALL
  TO service_role
  USING (true);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_async_jobs_status ON async_jobs(status);
CREATE INDEX IF NOT EXISTS idx_async_jobs_user_id ON async_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_async_jobs_created_at ON async_jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_async_jobs_type_status ON async_jobs(type, status);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_period_end ON user_subscriptions(current_period_end);

CREATE INDEX IF NOT EXISTS idx_usage_quotas_user_period ON usage_quotas(user_id, period);
CREATE INDEX IF NOT EXISTS idx_usage_quotas_period ON usage_quotas(period);

CREATE INDEX IF NOT EXISTS idx_system_metrics_name_timestamp ON system_metrics(name, timestamp);
CREATE INDEX IF NOT EXISTS idx_system_metrics_timestamp ON system_metrics(timestamp);

CREATE INDEX IF NOT EXISTS idx_system_alerts_resolved ON system_alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_system_alerts_severity ON system_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_system_alerts_timestamp ON system_alerts(timestamp);

CREATE INDEX IF NOT EXISTS idx_user_actions_user_id ON user_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_actions_action ON user_actions(action);
CREATE INDEX IF NOT EXISTS idx_user_actions_timestamp ON user_actions(timestamp);

-- Partitioning for large tables (commented out - enable when needed)
-- CREATE TABLE system_metrics_y2025m01 PARTITION OF system_metrics
--   FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- Auto-cleanup old data (runs daily)
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
  -- Clean up old completed jobs (older than 30 days)
  DELETE FROM async_jobs 
  WHERE status IN ('completed', 'failed') 
    AND created_at < NOW() - INTERVAL '30 days';
  
  -- Clean up old metrics (older than 90 days)
  DELETE FROM system_metrics 
  WHERE timestamp < NOW() - INTERVAL '90 days';
  
  -- Clean up resolved alerts (older than 30 days)
  DELETE FROM system_alerts 
  WHERE resolved = true 
    AND resolved_at < NOW() - INTERVAL '30 days';
    
  -- Clean up old user actions (older than 1 year)
  DELETE FROM user_actions 
  WHERE timestamp < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-old-data', '0 2 * * *', 'SELECT cleanup_old_data();');