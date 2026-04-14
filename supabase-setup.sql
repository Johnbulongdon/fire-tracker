-- FIRE Dashboard Database Schema
-- Run this in your Supabase SQL Editor

-- Create user_plans table with user_id for Row Level Security
CREATE TABLE IF NOT EXISTS user_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL DEFAULT 'My FIRE Plan',
  current_age INTEGER NOT NULL,
  monthly_income DECIMAL(10,2) NOT NULL,
  monthly_invest DECIMAL(10,2) NOT NULL,
  monthly_spend DECIMAL(10,2) NOT NULL,
  current_stash DECIMAL(12,2) NOT NULL,
  fire_number DECIMAL(12,2) NOT NULL,
  expected_return DECIMAL(5,2) DEFAULT 7.0,
  withdrawal_rate DECIMAL(5,2) DEFAULT 4.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS user_plans_user_id_idx ON user_plans(user_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS user_plans_created_at_idx ON user_plans(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE user_plans ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own plans
CREATE POLICY "Users can view their own plans"
  ON user_plans
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own plans
CREATE POLICY "Users can insert their own plans"
  ON user_plans
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own plans
CREATE POLICY "Users can update their own plans"
  ON user_plans
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own plans
CREATE POLICY "Users can delete their own plans"
  ON user_plans
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_user_plans_updated_at ON user_plans;
CREATE TRIGGER update_user_plans_updated_at
  BEFORE UPDATE ON user_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON user_plans TO authenticated;
GRANT ALL ON user_plans TO service_role;
