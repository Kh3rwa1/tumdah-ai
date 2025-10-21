import { incrementUsageStat, logActivity } from './supabase';

export const trackImageGeneration = async (count = 1) => {
    try {
        await incrementUsageStat('total_images', count);
        await incrementUsageStat('api_calls_today', 1);
    } catch (error) {
        console.error('Error tracking image generation:', error);
    }
};

export const trackStoryboardCreation = async () => {
    try {
        await incrementUsageStat('total_storyboards', 1);
        await incrementUsageStat('api_calls_today', 1);
    } catch (error) {
        console.error('Error tracking storyboard creation:', error);
    }
};

export const trackStyleTransfer = async () => {
    try {
        await incrementUsageStat('total_style_transfers', 1);
        await incrementUsageStat('api_calls_today', 1);
    } catch (error) {
        console.error('Error tracking style transfer:', error);
    }
};

export const trackExport = async () => {
    try {
        await incrementUsageStat('total_exports', 1);
    } catch (error) {
        console.error('Error tracking export:', error);
    }
};

export const trackUserActivity = async (userName, action, actionType) => {
    try {
        await logActivity(userName, action, actionType);
    } catch (error) {
        console.error('Error tracking user activity:', error);
    }
};

export const updateActiveUsers = async (count) => {
    try {
        const { supabase } = await import('./supabase');
        const { data: stats } = await supabase
            .from('usage_stats')
            .select('id, active_users_now')
            .single();

        if (stats) {
            await supabase
                .from('usage_stats')
                .update({ active_users_now: count })
                .eq('id', stats.id);
        }
    } catch (error) {
        console.error('Error updating active users:', error);
    }
};
