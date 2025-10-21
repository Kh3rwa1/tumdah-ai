import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const fetchUsersCount = async () => {
    const { data, error } = await supabase
        .from('users_count')
        .select('count')
        .single();

    if (error) {
        console.error('Error fetching users count:', error);
        return 0;
    }
    return data?.count || 0;
};

export const fetchUsageStats = async () => {
    const { data, error } = await supabase
        .from('usage_stats')
        .select('*')
        .single();

    if (error) {
        console.error('Error fetching usage stats:', error);
        return null;
    }
    return data;
};

export const fetchActivityLog = async (limit = 10) => {
    const { data, error } = await supabase
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching activity log:', error);
        return [];
    }
    return data || [];
};

export const fetchSystemHealth = async () => {
    const { data, error } = await supabase
        .from('system_health')
        .select('*')
        .order('service_name');

    if (error) {
        console.error('Error fetching system health:', error);
        return [];
    }
    return data || [];
};

export const incrementUsageStat = async (field, increment = 1) => {
    const stats = await fetchUsageStats();
    if (!stats) return;

    const updates = {
        [field]: stats[field] + increment
    };

    const { error } = await supabase
        .from('usage_stats')
        .update(updates)
        .eq('id', stats.id);

    if (error) {
        console.error(`Error incrementing ${field}:`, error);
    }
};

export const logActivity = async (userName, action, actionType = 'general') => {
    const { error } = await supabase
        .from('activity_log')
        .insert([{ user_name: userName, action, action_type: actionType }]);

    if (error) {
        console.error('Error logging activity:', error);
    }
};

export const updateUsersCount = async (count) => {
    const { data: existing } = await supabase
        .from('users_count')
        .select('id')
        .single();

    if (existing) {
        const { error } = await supabase
            .from('users_count')
            .update({ count })
            .eq('id', existing.id);

        if (error) {
            console.error('Error updating users count:', error);
        }
    }
};
