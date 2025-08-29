/*
  # API Usage Tracking Table

  1. New Tables
    - `api_usage`
      - `id` (uuid, primary key)
      - `service` (text) - 'claude' or 'vision-ai'
      - `model` (text, optional) - specific model used
      - `operation` (text) - function name or operation type
      - `input_tokens` (integer, optional) - for text models
      - `output_tokens` (integer, optional) - for text models
      - `image_count` (integer, optional) - for vision models
      - `cost` (decimal) - calculated cost in USD
      - `success` (boolean) - whether the API call succeeded
      - `error_type` (text, optional) - error classification if failed
      - `user_id` (uuid, optional) - if user is authenticated
      - `session_id` (text) - for tracking anonymous sessions
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `api_usage` table
    - Add policy for service role access (for logging)
    - Add policy for authenticated users to read their own data
*/

CREATE TABLE IF NOT EXISTS api_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service text NOT NULL CHECK (service IN ('claude', 'vision-ai')),
  model text,
  operation text NOT NULL,
  input_tokens integer,
  output_tokens integer,
  image_count integer DEFAULT 0,
  cost decimal(10,6) NOT NULL DEFAULT 0,
  success boolean NOT NULL DEFAULT true,
  error_type text,
  user_id uuid REFERENCES auth.users(id),
  session_id text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

-- Policy for service role (for logging from Edge Functions)
CREATE POLICY "Service role can insert usage data"
  ON api_usage
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy for service role to read all data (for analytics)
CREATE POLICY "Service role can read all usage data"
  ON api_usage
  FOR SELECT
  TO service_role
  USING (true);

-- Policy for authenticated users to read their own data
CREATE POLICY "Users can read own usage data"
  ON api_usage
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_api_usage_created_at ON api_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_api_usage_service ON api_usage(service);
CREATE INDEX IF NOT EXISTS idx_api_usage_user_id ON api_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_session_id ON api_usage(session_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_success ON api_usage(success);

-- View for daily cost summaries
CREATE OR REPLACE VIEW daily_api_costs AS
SELECT 
  DATE(created_at) as date,
  service,
  model,
  COUNT(*) as request_count,
  SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful_requests,
  SUM(cost) as total_cost,
  AVG(cost) as avg_cost_per_request,
  SUM(input_tokens) as total_input_tokens,
  SUM(output_tokens) as total_output_tokens,
  SUM(image_count) as total_images
FROM api_usage
GROUP BY DATE(created_at), service, model
ORDER BY date DESC, total_cost DESC;