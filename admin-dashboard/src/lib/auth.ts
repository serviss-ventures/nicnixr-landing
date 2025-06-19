import { supabase } from './supabase';

export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('id, is_active')
      .eq('id', userId)
      .eq('is_active', true)
      .single();

    return !error && !!data;
  } catch {
    return false;
  }
}

export async function logAdminAction(
  action: string,
  resourceType?: string,
  resourceId?: string,
  details?: any
) {
  try {
    const { error } = await supabase.rpc('log_admin_action', {
      action_type: action,
      resource_type: resourceType,
      resource_id: resourceId,
      details: details ? JSON.stringify(details) : null
    });

    if (error) {
      console.error('Failed to log admin action:', error);
    }
  } catch (err) {
    console.error('Error logging admin action:', err);
  }
}

export async function getAdminUser(userId: string) {
  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
} 