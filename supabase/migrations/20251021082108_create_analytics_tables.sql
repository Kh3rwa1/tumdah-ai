/*
  # Create Analytics and Usage Tracking Tables

  1. New Tables
    - `users_count`
      - `id` (uuid, primary key) - Unique identifier
      - `count` (integer) - Total number of users
      - `updated_at` (timestamptz) - Last update timestamp
    
    - `usage_stats`
      - `id` (uuid, primary key) - Unique identifier
      - `total_images` (integer) - Total images generated
      - `total_storyboards` (integer) - Total storyboards created
      - `total_style_transfers` (integer) - Total style transfers
      - `total_exports` (integer) - Total exports
      - `api_calls_today` (integer) - API calls made today
      - `active_users_now` (integer) - Currently active users
      - `monthly_revenue` (numeric) - Monthly revenue in dollars
      - `avg_response_time` (numeric) - Average response time in seconds
      - `success_rate` (numeric) - Success rate percentage
      - `storage_used_tb` (numeric) - Storage used in terabytes
      - `updated_at` (timestamptz) - Last update timestamp

    - `activity_log`
      - `id` (uuid, primary key) - Unique identifier
      - `user_name` (text) - User name
      - `action` (text) - Action performed
      - `action_type` (text) - Type of action (generation, upload, project, export)
      - `created_at` (timestamptz) - Timestamp of action

    - `system_health`
      - `id` (uuid, primary key) - Unique identifier
      - `service_name` (text) - Service name
      - `status` (text) - Service status
      - `uptime_percentage` (numeric) - Uptime percentage
      - `response_time` (text) - Response time
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on all tables
    - Allow public read access for dashboard display
    - Restrict write access to authenticated users only

  3. Initial Data
    - Insert default analytics data
    - Insert sample activity logs
    - Insert system health status
*/

CREATE TABLE IF NOT EXISTS users_count (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  count integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS usage_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  total_images integer DEFAULT 0,
  total_storyboards integer DEFAULT 0,
  total_style_transfers integer DEFAULT 0,
  total_exports integer DEFAULT 0,
  api_calls_today integer DEFAULT 0,
  active_users_now integer DEFAULT 0,
  monthly_revenue numeric DEFAULT 0,
  avg_response_time numeric DEFAULT 0,
  success_rate numeric DEFAULT 99.8,
  storage_used_tb numeric DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name text NOT NULL,
  action text NOT NULL,
  action_type text DEFAULT 'general',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS system_health (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name text UNIQUE NOT NULL,
  status text DEFAULT 'Operational',
  uptime_percentage numeric DEFAULT 99.99,
  response_time text DEFAULT '0ms',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users_count ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_health ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read users count"
  ON users_count FOR SELECT USING (true);

CREATE POLICY "Anyone can read usage stats"
  ON usage_stats FOR SELECT USING (true);

CREATE POLICY "Anyone can read activity log"
  ON activity_log FOR SELECT USING (true);

CREATE POLICY "Anyone can read system health"
  ON system_health FOR SELECT USING (true);

CREATE POLICY "Authenticated users can update users count"
  ON users_count FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update usage stats"
  ON usage_stats FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert activity log"
  ON activity_log FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update system health"
  ON system_health FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

INSERT INTO users_count (count) VALUES (0) ON CONFLICT DO NOTHING;

INSERT INTO usage_stats (
  total_images,
  total_storyboards,
  total_style_transfers,
  total_exports,
  api_calls_today,
  active_users_now,
  monthly_revenue,
  avg_response_time,
  success_rate,
  storage_used_tb
) VALUES (0, 0, 0, 0, 0, 0, 0, 1.24, 99.8, 0.1)
ON CONFLICT DO NOTHING;

INSERT INTO system_health (service_name, status, uptime_percentage, response_time) VALUES
  ('API Server', 'Operational', 99.98, '124ms'),
  ('Database', 'Operational', 99.99, '8ms'),
  ('AI Processing', 'Operational', 99.95, '1.2s'),
  ('Storage', 'Operational', 100, '45ms')
ON CONFLICT (service_name) DO NOTHING;

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_count_updated_at
  BEFORE UPDATE ON users_count
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER usage_stats_updated_at
  BEFORE UPDATE ON usage_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER system_health_updated_at
  BEFORE UPDATE ON system_health
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();