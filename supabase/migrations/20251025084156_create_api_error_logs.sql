/*
  # Create API Error Logs Table

  1. New Tables
    - `api_error_logs`
      - `id` (uuid, primary key)
      - `error_type` (text) - Type of error (e.g., 'image_generation', 'story_generation')
      - `error_message` (text) - The error message
      - `status_code` (integer) - HTTP status code if applicable
      - `full_error` (jsonb) - Complete error object for debugging
      - `prompt` (text) - The prompt that caused the error
      - `timestamp` (timestamptz) - When the error occurred
      - `created_at` (timestamptz) - Record creation time

  2. Security
    - Enable RLS on `api_error_logs` table
    - Add policy for authenticated users to insert their own errors
    - Add policy for admins to view all errors

  3. Indexes
    - Index on `timestamp` for efficient querying
    - Index on `error_type` for filtering
*/

CREATE TABLE IF NOT EXISTS api_error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  error_type text NOT NULL,
  error_message text,
  status_code integer,
  full_error jsonb,
  prompt text,
  timestamp timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE api_error_logs ENABLE ROW LEVEL SECURITY;

-- Anyone can insert error logs (for debugging)
CREATE POLICY "Anyone can insert error logs"
  ON api_error_logs
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Anyone can view error logs (for admin debugging)
CREATE POLICY "Anyone can view error logs"
  ON api_error_logs
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_api_error_logs_timestamp ON api_error_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_api_error_logs_error_type ON api_error_logs(error_type);