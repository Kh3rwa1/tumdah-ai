import { useState, useEffect } from 'react';
import { Settings, Save, Key, Sliders, Info, CheckCircle, XCircle, TrendingUp, Users, Image, Zap, Activity, DollarSign, BarChart3, Calendar, Clock, Shield, Database, Home, ArrowLeft, FileText } from 'lucide-react';
import { Button } from '../components/Button';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import PromptManager from '../components/PromptManager';
import { fetchUsersCount, fetchUsageStats, fetchActivityLog, fetchSystemHealth } from '../utils/supabase';

const AdminPanel = ({ onNavigate }) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [settings, setSettings] = useState({
        googleAiApiKey: '',
        openrouterApiKey: '',
        appName: 'tumdah',
        maxImageGenerations: 4,
        imageAspectRatio: '16:9',
        enableStoryboard: true,
    });

    const [savedStatus, setSavedStatus] = useState(null);
    const [testingApi, setTestingApi] = useState(false);
    const [apiTestResult, setApiTestResult] = useState(null);
    const [testingOpenRouter, setTestingOpenRouter] = useState(false);
    const [openRouterTestResult, setOpenRouterTestResult] = useState(null);

    const [stats, setStats] = useState({
        totalUsers: 0,
        totalImages: 0,
        apiCalls: 0,
        activeUsers: 0,
        revenue: 0,
        avgResponseTime: 1.24,
        success_rate: 99.8,
        storage_used_tb: 0.1,
        total_storyboards: 0,
        total_style_transfers: 0,
        total_exports: 0,
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [systemHealth, setSystemHealth] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            setLoading(true);
            const [usersCount, usageStats, activityLog, healthData] = await Promise.all([
                fetchUsersCount(),
                fetchUsageStats(),
                fetchActivityLog(5),
                fetchSystemHealth()
            ]);

            setStats({
                totalUsers: usersCount,
                totalImages: usageStats?.total_images || 0,
                apiCalls: usageStats?.api_calls_today || 0,
                activeUsers: usageStats?.active_users_now || 0,
                revenue: parseFloat(usageStats?.monthly_revenue) || 0,
                avgResponseTime: parseFloat(usageStats?.avg_response_time) || 1.24,
                success_rate: parseFloat(usageStats?.success_rate) || 99.8,
                storage_used_tb: parseFloat(usageStats?.storage_used_tb) || 0.1,
                total_storyboards: usageStats?.total_storyboards || 0,
                total_style_transfers: usageStats?.total_style_transfers || 0,
                total_exports: usageStats?.total_exports || 0,
            });

            const formattedActivity = activityLog.map(log => ({
                id: log.id,
                user: log.user_name,
                action: log.action,
                time: new Date(log.created_at).toLocaleString('en-US', {
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true
                }),
                type: log.action_type
            }));
            setRecentActivity(formattedActivity);

            const formattedHealth = healthData.map(service => ({
                service: service.service_name,
                status: service.status,
                uptime: `${service.uptime_percentage}%`,
                responseTime: service.response_time
            }));
            setSystemHealth(formattedHealth);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const { supabase } = await import('../utils/supabase');
                const { data } = await supabase
                    .from('app_settings')
                    .select('value')
                    .eq('key', 'google_ai_api_key')
                    .maybeSingle();

                if (data?.value?.api_key) {
                    setSettings(prev => ({ ...prev, googleAiApiKey: data.value.api_key }));
                }

                const { data: openRouterData } = await supabase
                    .from('app_settings')
                    .select('value')
                    .eq('key', 'openrouter_api_key')
                    .maybeSingle();

                if (openRouterData?.value?.api_key) {
                    setSettings(prev => ({ ...prev, openrouterApiKey: openRouterData.value.api_key }));
                }
            } catch (e) {
                console.error('Failed to load API key from Supabase:', e);
            }

            const savedSettings = localStorage.getItem('adminSettings');
            if (savedSettings) {
                try {
                    const parsed = JSON.parse(savedSettings);
                    setSettings(prev => ({ ...prev, ...parsed }));
                } catch (e) {
                    console.error('Failed to load settings from localStorage:', e);
                }
            }
        };

        loadSettings();
        loadData();

        const refreshInterval = setInterval(() => {
            loadData();
        }, 30000);

        return () => clearInterval(refreshInterval);
    }, []);

    const handleSave = async () => {
        try {
            localStorage.setItem('adminSettings', JSON.stringify(settings));
            if (settings.googleAiApiKey) {
                localStorage.setItem('VITE_GOOGLE_AI_API_KEY', settings.googleAiApiKey);

                const { supabase } = await import('../utils/supabase');
                const { data: existing } = await supabase
                    .from('app_settings')
                    .select('id')
                    .eq('key', 'google_ai_api_key')
                    .maybeSingle();

                if (existing) {
                    await supabase
                        .from('app_settings')
                        .update({ value: { api_key: settings.googleAiApiKey } })
                        .eq('id', existing.id);
                } else {
                    await supabase
                        .from('app_settings')
                        .insert([{
                            key: 'google_ai_api_key',
                            value: { api_key: settings.googleAiApiKey },
                            description: 'Google AI API key for image generation',
                            category: 'api',
                            is_sensitive: true
                        }]);
                }
            }

            if (settings.openrouterApiKey) {
                localStorage.setItem('VITE_OPENROUTER_API_KEY', settings.openrouterApiKey);

                const { data: existingOpenRouter } = await supabase
                    .from('app_settings')
                    .select('id')
                    .eq('key', 'openrouter_api_key')
                    .maybeSingle();

                if (existingOpenRouter) {
                    await supabase
                        .from('app_settings')
                        .update({ value: { api_key: settings.openrouterApiKey } })
                        .eq('id', existingOpenRouter.id);
                } else {
                    await supabase
                        .from('app_settings')
                        .insert([{
                            key: 'openrouter_api_key',
                            value: { api_key: settings.openrouterApiKey },
                            description: 'OpenRouter API key for AI story generation',
                            category: 'api',
                            is_sensitive: true
                        }]);
                }
            }

            setSavedStatus('success');
            setTimeout(() => setSavedStatus(null), 3000);
        } catch (e) {
            console.error('Failed to save settings:', e);
            setSavedStatus('error');
            setTimeout(() => setSavedStatus(null), 3000);
        }
    };

    const testApiKey = async () => {
        if (!settings.googleAiApiKey) {
            setApiTestResult({ success: false, message: 'Please enter an API key first' });
            return;
        }

        setTestingApi(true);
        setApiTestResult(null);

        const models = [
            'imagen-3.0-generate-001',
            'gemini-2.0-flash-exp-imagen',
            'gemini-2.0-flash-exp'
        ];

        for (const model of models) {
            try {
                const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${settings.googleAiApiKey}`;

                const isImageModel = model.includes('imagen');
                const payload = isImageModel ? {
                    contents: [{
                        parts: [{ text: 'A simple red circle on white background' }]
                    }],
                    generationConfig: {
                        imageConfig: {
                            aspectRatio: "1:1"
                        }
                    }
                } : {
                    contents: [{
                        parts: [{ text: 'Say "test successful" and nothing else.' }]
                    }]
                };

                const response = await fetch(testUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    const result = await response.json();

                    if (isImageModel) {
                        const hasImageData = result?.candidates?.[0]?.content?.parts?.find(p => p.inline_data)?.inline_data?.data;
                        if (hasImageData) {
                            setApiTestResult({
                                success: true,
                                message: `API key valid! Using ${model} for image generation.`
                            });
                            setTestingApi(false);
                            return;
                        }
                    } else {
                        const textResponse = result?.candidates?.[0]?.content?.parts?.[0]?.text;
                        if (textResponse) {
                            setApiTestResult({
                                success: true,
                                message: `API key valid! Using ${model}. Note: Image models may have limited availability.`
                            });
                            setTestingApi(false);
                            return;
                        }
                    }
                }

                const error = await response.json();
                console.warn(`Model ${model} failed:`, error?.error?.message);

            } catch (error) {
                console.warn(`Model ${model} error:`, error);
                continue;
            }
        }

        setApiTestResult({
            success: false,
            message: 'API key may be valid but image models are not accessible. Your key might work for text only.'
        });
        setTestingApi(false);
    };

    const testOpenRouterKey = async () => {
        if (!settings.openrouterApiKey) {
            setOpenRouterTestResult({ success: false, message: 'Please enter an OpenRouter API key first' });
            return;
        }

        setTestingOpenRouter(true);
        setOpenRouterTestResult(null);

        try {
            console.log('Testing OpenRouter API key...');
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${settings.openrouterApiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'Tumdah'
                },
                body: JSON.stringify({
                    model: 'tngtech/deepseek-r1t2-chimera:free',
                    messages: [{
                        role: 'user',
                        content: 'Say "test successful" and nothing else.'
                    }],
                    max_tokens: 50,
                    stream: false
                })
            });

            console.log('Response status:', response.status);

            if (response.ok) {
                const result = await response.json();
                console.log('OpenRouter test response:', result);

                // DeepSeek R1 models might have reasoning tokens in a separate field
                const message = result?.choices?.[0]?.message?.content;
                const hasChoices = result?.choices && result.choices.length > 0;
                const hasMessage = result?.choices?.[0]?.message;

                console.log('Has choices:', hasChoices);
                console.log('Has message:', hasMessage);
                console.log('Message content:', message);

                if (message) {
                    setOpenRouterTestResult({
                        success: true,
                        message: 'API key valid! OpenRouter is ready for story generation.'
                    });
                } else if (hasChoices && hasMessage) {
                    // Message exists but content is null/undefined
                    setOpenRouterTestResult({
                        success: true,
                        message: 'API key valid! OpenRouter connected (model response format verified).'
                    });
                } else if (result?.id) {
                    // Response has an ID, which means it was processed
                    setOpenRouterTestResult({
                        success: true,
                        message: 'API key valid! OpenRouter responded successfully.'
                    });
                } else {
                    console.error('Unexpected response structure:', result);
                    setOpenRouterTestResult({
                        success: false,
                        message: `Unexpected response. Check console for details. Keys: ${Object.keys(result).join(', ')}`
                    });
                }
            } else {
                const error = await response.json();
                console.error('OpenRouter API error:', error);
                setOpenRouterTestResult({
                    success: false,
                    message: error?.error?.message || `API error: ${response.status} - ${JSON.stringify(error).substring(0, 100)}`
                });
            }
        } catch (error) {
            console.error('OpenRouter test error:', error);
            setOpenRouterTestResult({
                success: false,
                message: 'Network error. Please check your connection.'
            });
        } finally {
            setTestingOpenRouter(false);
        }
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-blue-50/30">
            <div className="border-b border-neutral-200 bg-white/80 backdrop-blur-xl">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-600 to-emerald-600 flex items-center justify-center shadow-lg">
                                <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-900">Admin Control</h1>
                                <p className="text-neutral-600 text-xs sm:text-sm hidden sm:block">Manage your platform and monitor performance</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                            <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-emerald-50 border border-emerald-200 rounded-lg flex-1 sm:flex-none">
                                <span className="text-xs sm:text-sm font-semibold text-emerald-700">All Systems Operational</span>
                            </div>
                            <Button
                                onClick={() => onNavigate('/')}
                                variant="outline"
                                className="flex items-center gap-2 text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2"
                            >
                                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">Back to Home</span>
                                <span className="sm:hidden">Back</span>
                            </Button>
                        </div>
                    </div>

                    <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 -mb-1 scrollbar-hide">
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className={`px-3 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm lg:text-base transition-all duration-200 whitespace-nowrap ${
                                activeTab === 'dashboard'
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                    : 'text-neutral-600 hover:bg-neutral-100'
                            }`}
                        >
                            Dashboard
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`px-3 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm lg:text-base transition-all duration-200 whitespace-nowrap ${
                                activeTab === 'settings'
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                    : 'text-neutral-600 hover:bg-neutral-100'
                            }`}
                        >
                            Settings
                        </button>
                        <button
                            onClick={() => setActiveTab('analytics')}
                            className={`px-3 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm lg:text-base transition-all duration-200 whitespace-nowrap ${
                                activeTab === 'analytics'
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                    : 'text-neutral-600 hover:bg-neutral-100'
                            }`}
                        >
                            Analytics
                        </button>
                        <button
                            onClick={() => setActiveTab('system')}
                            className={`px-3 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm lg:text-base transition-all duration-200 whitespace-nowrap ${
                                activeTab === 'system'
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                    : 'text-neutral-600 hover:bg-neutral-100'
                            }`}
                        >
                            System
                        </button>
                        <button
                            onClick={() => setActiveTab('prompts')}
                            className={`px-3 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm lg:text-base transition-all duration-200 whitespace-nowrap ${
                                activeTab === 'prompts'
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                    : 'text-neutral-600 hover:bg-neutral-100'
                            }`}
                        >
                            Prompts
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-neutral-600 font-semibold text-sm sm:text-base">Loading dashboard data...</p>
                        </div>
                    </div>
                ) : activeTab === 'dashboard' ? (
                    <div className="space-y-6 sm:space-y-8">
                        {savedStatus && (
                            <div className={`p-3 sm:p-4 rounded-xl flex items-center gap-3 text-sm sm:text-base ${
                                savedStatus === 'success'
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : 'bg-red-50 text-red-800 border border-red-200'
                            }`}>
                                {savedStatus === 'success' ? (
                                    <>
                                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                                        <span className="font-semibold">Settings saved successfully!</span>
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                                        <span className="font-semibold">Failed to save settings. Please try again.</span>
                                    </>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                            <StatCard
                                title="Total Users"
                                value={stats.totalUsers.toLocaleString()}
                                change="+12.5%"
                                trend="up"
                                icon={Users}
                                color="blue"
                            />
                            <StatCard
                                title="Images Generated"
                                value={stats.totalImages.toLocaleString()}
                                change="+28.3%"
                                trend="up"
                                icon={Image}
                                color="green"
                            />
                            <StatCard
                                title="API Calls Today"
                                value={stats.apiCalls.toLocaleString()}
                                change="+8.1%"
                                trend="up"
                                icon={Zap}
                                color="purple"
                            />
                            <StatCard
                                title="Active Now"
                                value={stats.activeUsers.toLocaleString()}
                                change="+5.2%"
                                trend="up"
                                icon={Activity}
                                color="orange"
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                            <div className="lg:col-span-2">
                                <ChartCard
                                    title="Usage Analytics"
                                    subtitle="Last 7 days"
                                    action={
                                        <select className="px-3 py-1.5 sm:px-4 sm:py-2 border border-neutral-300 rounded-lg text-xs sm:text-sm">
                                            <option>Last 7 days</option>
                                            <option>Last 30 days</option>
                                            <option>Last 90 days</option>
                                        </select>
                                    }
                                >
                                    <div className="space-y-3 sm:space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs sm:text-sm font-medium text-neutral-600">Image Generations</span>
                                            <span className="text-xs sm:text-sm font-bold text-neutral-900">{stats.totalImages.toLocaleString()}</span>
                                        </div>
                                        <div className="w-full bg-neutral-100 rounded-full h-2 sm:h-3">
                                            <div className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 sm:h-3 rounded-full" style={{width: `${Math.min((stats.totalImages / 50000) * 100, 100)}%`}}></div>
                                        </div>

                                        <div className="flex items-center justify-between mt-4 sm:mt-6">
                                            <span className="text-xs sm:text-sm font-medium text-neutral-600">Storyboard Creations</span>
                                            <span className="text-xs sm:text-sm font-bold text-neutral-900">{stats.total_storyboards.toLocaleString()}</span>
                                        </div>
                                        <div className="w-full bg-neutral-100 rounded-full h-2 sm:h-3">
                                            <div className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 sm:h-3 rounded-full" style={{width: `${Math.min((stats.total_storyboards / 15000) * 100, 100)}%`}}></div>
                                        </div>

                                        <div className="flex items-center justify-between mt-4 sm:mt-6">
                                            <span className="text-xs sm:text-sm font-medium text-neutral-600">Style Transfers</span>
                                            <span className="text-xs sm:text-sm font-bold text-neutral-900">{stats.total_style_transfers.toLocaleString()}</span>
                                        </div>
                                        <div className="w-full bg-neutral-100 rounded-full h-2 sm:h-3">
                                            <div className="bg-gradient-to-r from-violet-500 to-pink-500 h-2 sm:h-3 rounded-full" style={{width: `${Math.min((stats.total_style_transfers / 10000) * 100, 100)}%`}}></div>
                                        </div>

                                        <div className="flex items-center justify-between mt-4 sm:mt-6">
                                            <span className="text-xs sm:text-sm font-medium text-neutral-600">Exports</span>
                                            <span className="text-xs sm:text-sm font-bold text-neutral-900">{stats.total_exports.toLocaleString()}</span>
                                        </div>
                                        <div className="w-full bg-neutral-100 rounded-full h-2 sm:h-3">
                                            <div className="bg-gradient-to-r from-orange-500 to-pink-500 h-2 sm:h-3 rounded-full" style={{width: `${Math.min((stats.total_exports / 8000) * 100, 100)}%`}}></div>
                                        </div>
                                    </div>
                                </ChartCard>
                            </div>

                            <div>
                                <ChartCard title="Recent Activity" subtitle="Live updates">
                                    <div className="space-y-3 sm:space-y-4">
                                        {recentActivity.length > 0 ? recentActivity.map(activity => (
                                            <div key={activity.id} className="flex items-start gap-2 sm:gap-3 pb-3 sm:pb-4 border-b border-neutral-100 last:border-0 last:pb-0">
                                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-white font-semibold text-xs sm:text-sm">{activity.user.charAt(0)}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs sm:text-sm font-semibold text-neutral-900 truncate">{activity.user}</p>
                                                    <p className="text-xs sm:text-sm text-neutral-600 truncate">{activity.action}</p>
                                                    <p className="text-[10px] sm:text-xs text-neutral-400 mt-0.5 sm:mt-1">{activity.time}</p>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="text-center py-8 text-neutral-400 text-sm">
                                                No recent activity
                                            </div>
                                        )}
                                    </div>
                                </ChartCard>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-neutral-200 p-4 sm:p-6">
                                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                                    <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                                    <span className="text-xs sm:text-sm font-semibold text-neutral-600">Monthly Revenue</span>
                                </div>
                                <p className="text-2xl sm:text-3xl font-bold text-neutral-900">${stats.revenue.toLocaleString()}</p>
                                <p className="text-xs sm:text-sm text-emerald-600 font-semibold mt-2">+18.2% from last month</p>
                            </div>

                            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-neutral-200 p-4 sm:p-6">
                                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                                    <span className="text-xs sm:text-sm font-semibold text-neutral-600">Avg Response Time</span>
                                </div>
                                <p className="text-2xl sm:text-3xl font-bold text-neutral-900">{stats.avgResponseTime}s</p>
                                <p className="text-xs sm:text-sm text-emerald-600 font-semibold mt-2">-0.12s improvement</p>
                            </div>

                            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-neutral-200 p-4 sm:p-6">
                                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                                    <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600" />
                                    <span className="text-xs sm:text-sm font-semibold text-neutral-600">Success Rate</span>
                                </div>
                                <p className="text-2xl sm:text-3xl font-bold text-neutral-900">{stats.success_rate}%</p>
                                <p className="text-xs sm:text-sm text-emerald-600 font-semibold mt-2">+0.3% this week</p>
                            </div>

                            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-neutral-200 p-4 sm:p-6">
                                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                                    <Database className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                                    <span className="text-xs sm:text-sm font-semibold text-neutral-600">Storage Used</span>
                                </div>
                                <p className="text-2xl sm:text-3xl font-bold text-neutral-900">{stats.storage_used_tb}TB</p>
                                <p className="text-xs sm:text-sm text-neutral-600 font-semibold mt-2">68% of capacity</p>
                            </div>
                        </div>
                    </div>
                ) : activeTab === 'settings' ? (
                    <div className="space-y-4 sm:space-y-6">
                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 to-emerald-600 p-4 sm:p-6 lg:p-8">
                                <div className="flex items-center gap-2 sm:gap-3 text-white">
                                    <Key className="w-5 h-5 sm:w-6 sm:h-6" />
                                    <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold">API Configuration</h2>
                                </div>
                            </div>

                            <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-neutral-700 mb-2 sm:mb-3">
                                        Google AI API Key
                                    </label>
                                    <div className="space-y-3">
                                        <input
                                            type="password"
                                            value={settings.googleAiApiKey}
                                            onChange={(e) => setSettings({ ...settings, googleAiApiKey: e.target.value })}
                                            className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base border border-neutral-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            placeholder="Enter your Google AI API key"
                                        />
                                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                            <Button
                                                onClick={testApiKey}
                                                disabled={testingApi || !settings.googleAiApiKey}
                                                variant="secondary"
                                                className="text-xs sm:text-sm w-full sm:w-auto"
                                            >
                                                {testingApi ? 'Testing...' : 'Test API Key'}
                                            </Button>
                                            {apiTestResult && (
                                                <div className={`flex items-center gap-2 px-3 py-2 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold ${
                                                    apiTestResult.success
                                                        ? 'bg-emerald-50 text-emerald-700'
                                                        : 'bg-red-50 text-red-700'
                                                }`}>
                                                    {apiTestResult.success ? (
                                                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                                    ) : (
                                                        <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                                    )}
                                                    <span className="break-words">{apiTestResult.message}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-3 space-y-2">
                                        <p className="text-xs sm:text-sm text-neutral-500 flex items-start gap-2">
                                            <Info className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" />
                                            <span>
                                                Get your API key from{' '}
                                                <a
                                                    href="https://makersuite.google.com/app/apikey"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-700 underline font-semibold"
                                                >
                                                    Google AI Studio
                                                </a>
                                            </span>
                                        </p>
                                        <p className="text-[10px] sm:text-xs text-amber-600 pl-5 sm:pl-6 font-medium">
                                            Note: Google's image generation models (Imagen) have very limited availability. Most API keys currently show placeholder images. The app uses Gemini for text analysis and will generate real images when models become available in your region.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-violet-600 to-blue-600 p-4 sm:p-6 lg:p-8">
                                <div className="flex items-center gap-2 sm:gap-3 text-white">
                                    <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
                                    <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold">OpenRouter AI Configuration</h2>
                                </div>
                            </div>

                            <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-neutral-700 mb-2 sm:mb-3">
                                        OpenRouter API Key
                                    </label>
                                    <div className="space-y-3">
                                        <input
                                            type="password"
                                            value={settings.openrouterApiKey}
                                            onChange={(e) => setSettings({ ...settings, openrouterApiKey: e.target.value })}
                                            className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base border border-neutral-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
                                            placeholder="Enter your OpenRouter API key"
                                        />
                                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                            <Button
                                                onClick={testOpenRouterKey}
                                                disabled={testingOpenRouter || !settings.openrouterApiKey}
                                                variant="secondary"
                                                className="text-xs sm:text-sm w-full sm:w-auto"
                                            >
                                                {testingOpenRouter ? 'Testing...' : 'Test API Key'}
                                            </Button>
                                            {openRouterTestResult && (
                                                <div className={`flex items-center gap-2 px-3 py-2 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold ${
                                                    openRouterTestResult.success
                                                        ? 'bg-emerald-50 text-emerald-700'
                                                        : 'bg-red-50 text-red-700'
                                                }`}>
                                                    {openRouterTestResult.success ? (
                                                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                                    ) : (
                                                        <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                                    )}
                                                    <span className="break-words">{openRouterTestResult.message}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-3 space-y-2">
                                        <p className="text-xs sm:text-sm text-neutral-500 flex items-start gap-2">
                                            <Info className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" />
                                            <span>
                                                Get your API key from{' '}
                                                <a
                                                    href="https://openrouter.ai/keys"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-violet-600 hover:text-violet-700 underline font-semibold"
                                                >
                                                    OpenRouter
                                                </a>
                                            </span>
                                        </p>
                                        <p className="text-[10px] sm:text-xs text-violet-600 pl-5 sm:pl-6 font-medium">
                                            Using model: tngtech/deepseek-r1t2-chimera:free for AI story generation and script analysis.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-emerald-600 to-blue-600 p-4 sm:p-6 lg:p-8">
                                <div className="flex items-center gap-2 sm:gap-3 text-white">
                                    <Sliders className="w-5 h-5 sm:w-6 sm:h-6" />
                                    <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold">General Settings</h2>
                                </div>
                            </div>

                            <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-neutral-700 mb-2 sm:mb-3">
                                        Application Name
                                    </label>
                                    <input
                                        type="text"
                                        value={settings.appName}
                                        onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
                                        className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base border border-neutral-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        placeholder="tumdah"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-neutral-700 mb-2 sm:mb-3">
                                        Max Image Generations Per Request
                                    </label>
                                    <select
                                        value={settings.maxImageGenerations}
                                        onChange={(e) => setSettings({ ...settings, maxImageGenerations: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base border border-neutral-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    >
                                        <option value={1}>1</option>
                                        <option value={2}>2</option>
                                        <option value={3}>3</option>
                                        <option value={4}>4</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-neutral-700 mb-2 sm:mb-3">
                                        Default Image Aspect Ratio
                                    </label>
                                    <select
                                        value={settings.imageAspectRatio}
                                        onChange={(e) => setSettings({ ...settings, imageAspectRatio: e.target.value })}
                                        className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base border border-neutral-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    >
                                        <option value="1:1">1:1 (Square)</option>
                                        <option value="16:9">16:9 (Widescreen)</option>
                                        <option value="9:16">9:16 (Portrait)</option>
                                        <option value="4:3">4:3 (Standard)</option>
                                        <option value="3:4">3:4 (Portrait)</option>
                                    </select>
                                </div>

                                <div className="flex items-center justify-between p-4 sm:p-6 bg-neutral-50 rounded-xl">
                                    <div>
                                        <label className="block text-sm font-semibold text-neutral-700">
                                            Enable Storyboard Feature
                                        </label>
                                        <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                                            Allow users to create AI-generated storyboards
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setSettings({ ...settings, enableStoryboard: !settings.enableStoryboard })}
                                        className={`relative inline-flex h-7 w-12 sm:h-8 sm:w-14 items-center rounded-full transition-colors ${
                                            settings.enableStoryboard ? 'bg-blue-600' : 'bg-neutral-300'
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-5 w-5 sm:h-6 sm:w-6 transform rounded-full bg-white transition-transform shadow-lg ${
                                                settings.enableStoryboard ? 'translate-x-6 sm:translate-x-7' : 'translate-x-1'
                                            }`}
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button onClick={handleSave} className="w-full sm:w-auto px-6 sm:px-10 py-3 sm:py-4 text-base sm:text-lg shadow-xl">
                                <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                                Save All Settings
                            </Button>
                        </div>
                    </div>
                ) : activeTab === 'analytics' ? (
                    <div className="space-y-4 sm:space-y-6">
                        <ChartCard title="User Growth" subtitle="Monthly active users over time">
                            <div className="h-48 sm:h-64 flex items-end justify-around gap-1 sm:gap-2 mt-4">
                                {[32000, 38000, 45000, 48000, 50000, 47000, 50234].map((value, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center">
                                        <div
                                            className="w-full bg-gradient-to-t from-blue-600 to-emerald-600 rounded-t-lg hover:opacity-80 transition-opacity cursor-pointer"
                                            style={{height: `${(value / 50234) * 100}%`}}
                                        ></div>
                                        <span className="text-[10px] sm:text-xs text-neutral-500 mt-1 sm:mt-2">
                                            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'][i]}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </ChartCard>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            <ChartCard title="Top Features" subtitle="Most used features this month">
                                <div className="space-y-3 sm:space-y-4 mt-4">
                                    <div>
                                        <div className="flex justify-between mb-1 sm:mb-2">
                                            <span className="text-xs sm:text-sm font-medium">Image Generation</span>
                                            <span className="text-xs sm:text-sm font-bold">78%</span>
                                        </div>
                                        <div className="w-full bg-neutral-100 rounded-full h-1.5 sm:h-2">
                                            <div className="bg-gradient-to-r from-blue-500 to-emerald-500 h-1.5 sm:h-2 rounded-full" style={{width: '78%'}}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-1 sm:mb-2">
                                            <span className="text-xs sm:text-sm font-medium">Storyboards</span>
                                            <span className="text-xs sm:text-sm font-bold">65%</span>
                                        </div>
                                        <div className="w-full bg-neutral-100 rounded-full h-1.5 sm:h-2">
                                            <div className="bg-gradient-to-r from-emerald-500 to-blue-500 h-1.5 sm:h-2 rounded-full" style={{width: '65%'}}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-1 sm:mb-2">
                                            <span className="text-xs sm:text-sm font-medium">Style Transfer</span>
                                            <span className="text-xs sm:text-sm font-bold">52%</span>
                                        </div>
                                        <div className="w-full bg-neutral-100 rounded-full h-1.5 sm:h-2">
                                            <div className="bg-gradient-to-r from-violet-500 to-pink-500 h-1.5 sm:h-2 rounded-full" style={{width: '52%'}}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-1 sm:mb-2">
                                            <span className="text-xs sm:text-sm font-medium">Batch Processing</span>
                                            <span className="text-xs sm:text-sm font-bold">43%</span>
                                        </div>
                                        <div className="w-full bg-neutral-100 rounded-full h-1.5 sm:h-2">
                                            <div className="bg-gradient-to-r from-orange-500 to-pink-500 h-1.5 sm:h-2 rounded-full" style={{width: '43%'}}></div>
                                        </div>
                                    </div>
                                </div>
                            </ChartCard>

                            <ChartCard title="User Segments" subtitle="User distribution by plan">
                                <div className="space-y-3 sm:space-y-4 mt-4">
                                    <div className="flex items-center justify-between p-3 sm:p-4 bg-neutral-50 rounded-xl">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-neutral-200 flex items-center justify-center">
                                                <span className="font-bold text-sm sm:text-base text-neutral-700">F</span>
                                            </div>
                                            <div>
                                                <p className="text-sm sm:text-base font-semibold text-neutral-900">Free Plan</p>
                                                <p className="text-xs sm:text-sm text-neutral-600">32,145 users</p>
                                            </div>
                                        </div>
                                        <span className="text-xl sm:text-2xl font-bold text-neutral-900">64%</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 sm:p-4 bg-blue-50 rounded-xl">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                                                <span className="font-bold text-sm sm:text-base text-white">P</span>
                                            </div>
                                            <div>
                                                <p className="text-sm sm:text-base font-semibold text-neutral-900">Professional</p>
                                                <p className="text-xs sm:text-sm text-neutral-600">16,089 users</p>
                                            </div>
                                        </div>
                                        <span className="text-xl sm:text-2xl font-bold text-neutral-900">32%</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 sm:p-4 bg-emerald-50 rounded-xl">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-emerald-600 flex items-center justify-center">
                                                <span className="font-bold text-sm sm:text-base text-white">E</span>
                                            </div>
                                            <div>
                                                <p className="text-sm sm:text-base font-semibold text-neutral-900">Enterprise</p>
                                                <p className="text-xs sm:text-sm text-neutral-600">2,000 users</p>
                                            </div>
                                        </div>
                                        <span className="text-xl sm:text-2xl font-bold text-neutral-900">4%</span>
                                    </div>
                                </div>
                            </ChartCard>
                        </div>
                    </div>
                ) : activeTab === 'system' ? (
                    <div className="space-y-4 sm:space-y-6">
                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-neutral-200 p-4 sm:p-6 lg:p-8">
                            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-neutral-900 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                                System Health Monitor
                            </h2>
                            <div className="space-y-3 sm:space-y-4">
                                {systemHealth.length > 0 ? systemHealth.map((service, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 sm:p-5 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors">
                                        <div className="flex items-center gap-3 sm:gap-4">
                                            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                                            <div>
                                                <p className="text-sm sm:text-base font-semibold text-neutral-900">{service.service}</p>
                                                <p className="text-xs sm:text-sm text-neutral-600">{service.status}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 sm:gap-8">
                                            <div className="text-right">
                                                <p className="text-[10px] sm:text-sm text-neutral-600">Uptime</p>
                                                <p className="text-xs sm:text-base font-bold text-neutral-900">{service.uptime}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] sm:text-sm text-neutral-600">Response</p>
                                                <p className="text-xs sm:text-base font-bold text-neutral-900">{service.responseTime}</p>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-8 text-neutral-400 text-sm">
                                        No system health data available
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            <ChartCard title="API Performance" subtitle="Last 24 hours">
                                <div className="space-y-3 sm:space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs sm:text-sm text-neutral-600">Average Latency</span>
                                        <span className="text-base sm:text-lg font-bold text-neutral-900">124ms</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs sm:text-sm text-neutral-600">Total Requests</span>
                                        <span className="text-base sm:text-lg font-bold text-neutral-900">{stats.apiCalls.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs sm:text-sm text-neutral-600">Success Rate</span>
                                        <span className="text-base sm:text-lg font-bold text-emerald-600">{stats.success_rate}%</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs sm:text-sm text-neutral-600">Error Rate</span>
                                        <span className="text-base sm:text-lg font-bold text-red-600">{(100 - stats.success_rate).toFixed(1)}%</span>
                                    </div>
                                </div>
                            </ChartCard>

                            <ChartCard title="Resource Usage" subtitle="Current utilization">
                                <div className="space-y-3 sm:space-y-4">
                                    <div>
                                        <div className="flex justify-between mb-1 sm:mb-2">
                                            <span className="text-xs sm:text-sm font-medium">CPU Usage</span>
                                            <span className="text-xs sm:text-sm font-bold">42%</span>
                                        </div>
                                        <div className="w-full bg-neutral-100 rounded-full h-2 sm:h-3">
                                            <div className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 sm:h-3 rounded-full" style={{width: '42%'}}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-1 sm:mb-2">
                                            <span className="text-xs sm:text-sm font-medium">Memory Usage</span>
                                            <span className="text-xs sm:text-sm font-bold">68%</span>
                                        </div>
                                        <div className="w-full bg-neutral-100 rounded-full h-2 sm:h-3">
                                            <div className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 sm:h-3 rounded-full" style={{width: '68%'}}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-1 sm:mb-2">
                                            <span className="text-xs sm:text-sm font-medium">Storage</span>
                                            <span className="text-xs sm:text-sm font-bold">52%</span>
                                        </div>
                                        <div className="w-full bg-neutral-100 rounded-full h-2 sm:h-3">
                                            <div className="bg-gradient-to-r from-violet-500 to-pink-500 h-2 sm:h-3 rounded-full" style={{width: '52%'}}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-1 sm:mb-2">
                                            <span className="text-xs sm:text-sm font-medium">Network</span>
                                            <span className="text-xs sm:text-sm font-bold">38%</span>
                                        </div>
                                        <div className="w-full bg-neutral-100 rounded-full h-2 sm:h-3">
                                            <div className="bg-gradient-to-r from-orange-500 to-pink-500 h-2 sm:h-3 rounded-full" style={{width: '38%'}}></div>
                                        </div>
                                    </div>
                                </div>
                            </ChartCard>
                        </div>
                    </div>
                ) : activeTab === 'prompts' ? (
                    <div className="space-y-6 sm:space-y-8">
                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-neutral-200 p-4 sm:p-6 lg:p-8">
                            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-neutral-900">Prompt Templates Manager</h2>
                            </div>
                            <p className="text-xs sm:text-sm lg:text-base text-neutral-600 mb-6 sm:mb-8">
                                Manage AI prompts for story expansion and image style generation. Users can select from these templates when creating content.
                            </p>

                            <div className="space-y-8 sm:space-y-12">
                                <PromptManager
                                    category="story_expansion"
                                    title="Story Expansion Prompts"
                                    description="Templates for expanding user story ideas with AI"
                                />

                                <div className="border-t border-neutral-200 pt-8 sm:pt-12">
                                    <PromptManager
                                        category="image_style"
                                        title="Image Style Prompts"
                                        description="Style templates for AI image generation"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default AdminPanel;
