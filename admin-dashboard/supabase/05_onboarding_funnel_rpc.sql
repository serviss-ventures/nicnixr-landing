-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_onboarding_funnel_data();

-- Create RPC function for onboarding funnel analytics
CREATE OR REPLACE FUNCTION get_onboarding_funnel_data()
RETURNS TABLE (
  step_number INT,
  step_name TEXT,
  users_reached BIGINT,
  users_completed BIGINT,
  avg_time_seconds INT
) AS $$
BEGIN
  RETURN QUERY
  WITH step_metrics AS (
    SELECT 
      oa.step_number,
      oa.step_name,
      COUNT(DISTINCT CASE WHEN oa.action IN ('started', 'completed') THEN oa.user_id END) as users_reached,
      COUNT(DISTINCT CASE WHEN oa.action = 'completed' THEN oa.user_id END) as users_completed,
      ROUND(AVG(oa.time_spent_seconds))::INT as avg_time_seconds
    FROM onboarding_analytics oa
    GROUP BY oa.step_number, oa.step_name
  )
  SELECT 
    sm.step_number,
    sm.step_name,
    sm.users_reached,
    sm.users_completed,
    COALESCE(sm.avg_time_seconds, 0) as avg_time_seconds
  FROM step_metrics sm
  ORDER BY sm.step_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_onboarding_funnel_data() TO authenticated;
GRANT EXECUTE ON FUNCTION get_onboarding_funnel_data() TO service_role;