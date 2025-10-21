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
        appName: 'tumdah',
        maxImageGenerations: 4,
        imageAspectRatio: '16:9',
        enableStoryboard: true,
    });

    const [savedStatus, setSavedStatus] = useState(null);
    const [testingApi, setTestingApi] = useState(false);
    const [apiTestResult, setApiTestResult] = useState(null);

    const [stats, setStats] = useState({
        totalUsers: 0,
        totalImages: 0,
        apiCalls: 0,
        activeUsers: 0,
        revenue: 0,
        avgResponseTime: 1.24,
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
                revenue: usageStats?.monthly_revenue || 0,
                avgResponseTime: usageStats?.avg_response_time || 1.24,
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


    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-blue-50/30">
            <div className="border-b border-neutral-200 bg-white/80 backdrop-blur-xl">
                <div className="max-w-[1600px] mx-auto px-8 py-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-emerald-600 flex items-center justify-center shadow-lg">
                                <Settings className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-neutral-900">Admin Control Center</h1>
                                <p className="text-neutral-600 text-sm">Manage your platform and monitor performance</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                                <span className="text-sm font-semibold text-emerald-700">All Systems Operational</span>
                            </div>
                            <Button
                                onClick={() => onNavigate('/')}
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Home
                            </Button>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                                activeTab === 'dashboard'
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                    : 'text-neutral-600 hover:bg-neutral-100'
                            }`}
                        >
                            Dashboard
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                                activeTab === 'settings'
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                    : 'text-neutral-600 hover:bg-neutral-100'
                            }`}
                        >
                            Settings
                        </button>
                        <button
                            onClick={() => setActiveTab('analytics')}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                                activeTab === 'analytics'
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                    : 'text-neutral-600 hover:bg-neutral-100'
                            }`}
                        >
                            Analytics
                        </button>
                        <button
                            onClick={() => setActiveTab('system')}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                                activeTab === 'system'
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                    : 'text-neutral-600 hover:bg-neutral-100'
                            }`}
                        >
                            System Health
                        </button>
                        <button
                            onClick={() => setActiveTab('prompts')}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                                activeTab === 'prompts'
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                    : 'text-neutral-600 hover:bg-neutral-100'
                            }`}
                        >
                            Prompt Manager
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto px-8 py-8">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-neutral-600 font-semibold">Loading dashboard data...</p>
                        </div>
                    </div>
                ) : activeTab === 'dashboard' ? (
                    <div className="space-y-8">
                        {savedStatus && (
                            <div className={`p-4 rounded-xl flex items-center gap-3 ${
                                savedStatus === 'success'
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : 'bg-red-50 text-red-800 border border-red-200'
                            }`}>
                                {savedStatus === 'success' ? (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        <span className="font-semibold">Settings saved successfully!</span>
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="w-5 h-5" />
                                        <span className="font-semibold">Failed to save settings. Please try again.</span>
                                    </>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <ChartCard
                                    title="Usage Analytics"
                                    subtitle="Last 7 days"
                                    action={
                                        <select className="px-4 py-2 border border-neutral-300 rounded-lg text-sm">
                                            <option>Last 7 days</option>
                                            <option>Last 30 days</option>
                                            <option>Last 90 days</option>
                                        </select>
                                    }
                                >
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-neutral-600">Image Generations</span>
                                            <span className="text-sm font-bold text-neutral-900">45,234</span>
                                        </div>
                                        <div className="w-full bg-neutral-100 rounded-full h-3">
                                            <div className="bg-gradient-to-r from-blue-500 to-emerald-500 h-3 rounded-full" style={{width: '85%'}}></div>
                                        </div>

                                        <div className="flex items-center justify-between mt-6">
                                            <span className="text-sm font-medium text-neutral-600">Storyboard Creations</span>
                                            <span className="text-sm font-bold text-neutral-900">12,856</span>
                                        </div>
                                        <div className="w-full bg-neutral-100 rounded-full h-3">
                                            <div className="bg-gradient-to-r from-emerald-500 to-blue-500 h-3 rounded-full" style={{width: '62%'}}></div>
                                        </div>

                                        <div className="flex items-center justify-between mt-6">
                                            <span className="text-sm font-medium text-neutral-600">Style Transfers</span>
                                            <span className="text-sm font-bold text-neutral-900">8,943</span>
                                        </div>
                                        <div className="w-full bg-neutral-100 rounded-full h-3">
                                            <div className="bg-gradient-to-r from-violet-500 to-pink-500 h-3 rounded-full" style={{width: '48%'}}></div>
                                        </div>

                                        <div className="flex items-center justify-between mt-6">
                                            <span className="text-sm font-medium text-neutral-600">Exports</span>
                                            <span className="text-sm font-bold text-neutral-900">6,721</span>
                                        </div>
                                        <div className="w-full bg-neutral-100 rounded-full h-3">
                                            <div className="bg-gradient-to-r from-orange-500 to-pink-500 h-3 rounded-full" style={{width: '35%'}}></div>
                                        </div>
                                    </div>
                                </ChartCard>
                            </div>

                            <div>
                                <ChartCard title="Recent Activity" subtitle="Live updates">
                                    <div className="space-y-4">
                                        {recentActivity.map(activity => (
                                            <div key={activity.id} className="flex items-start gap-3 pb-4 border-b border-neutral-100 last:border-0 last:pb-0">
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-white font-semibold text-sm">{activity.user.charAt(0)}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-neutral-900 truncate">{activity.user}</p>
                                                    <p className="text-sm text-neutral-600">{activity.action}</p>
                                                    <p className="text-xs text-neutral-400 mt-1">{activity.time}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ChartCard>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <DollarSign className="w-5 h-5 text-emerald-600" />
                                    <span className="text-sm font-semibold text-neutral-600">Monthly Revenue</span>
                                </div>
                                <p className="text-3xl font-bold text-neutral-900">${stats.revenue.toLocaleString()}</p>
                                <p className="text-sm text-emerald-600 font-semibold mt-2">+18.2% from last month</p>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <Clock className="w-5 h-5 text-blue-600" />
                                    <span className="text-sm font-semibold text-neutral-600">Avg Response Time</span>
                                </div>
                                <p className="text-3xl font-bold text-neutral-900">{stats.avgResponseTime}s</p>
                                <p className="text-sm text-emerald-600 font-semibold mt-2">-0.12s improvement</p>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <BarChart3 className="w-5 h-5 text-violet-600" />
                                    <span className="text-sm font-semibold text-neutral-600">Success Rate</span>
                                </div>
                                <p className="text-3xl font-bold text-neutral-900">99.8%</p>
                                <p className="text-sm text-emerald-600 font-semibold mt-2">+0.3% this week</p>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <Database className="w-5 h-5 text-orange-600" />
                                    <span className="text-sm font-semibold text-neutral-600">Storage Used</span>
                                </div>
                                <p className="text-3xl font-bold text-neutral-900">2.4TB</p>
                                <p className="text-sm text-neutral-600 font-semibold mt-2">68% of capacity</p>
                            </div>
                        </div>
                    </div>
                ) : activeTab === 'settings' ? (
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 to-emerald-600 p-8">
                                <div className="flex items-center gap-3 text-white">
                                    <Key className="w-6 h-6" />
                                    <h2 className="text-2xl font-semibold">API Configuration</h2>
                                </div>
                            </div>

                            <div className="p-8 space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-neutral-700 mb-3">
                                        Google AI API Key
                                    </label>
                                    <div className="space-y-3">
                                        <input
                                            type="password"
                                            value={settings.googleAiApiKey}
                                            onChange={(e) => setSettings({ ...settings, googleAiApiKey: e.target.value })}
                                            className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            placeholder="Enter your Google AI API key"
                                        />
                                        <div className="flex gap-3">
                                            <Button
                                                onClick={testApiKey}
                                                disabled={testingApi || !settings.googleAiApiKey}
                                                variant="secondary"
                                                className="text-sm"
                                            >
                                                {testingApi ? 'Testing...' : 'Test API Key'}
                                            </Button>
                                            {apiTestResult && (
                                                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${
                                                    apiTestResult.success
                                                        ? 'bg-emerald-50 text-emerald-700'
                                                        : 'bg-red-50 text-red-700'
                                                }`}>
                                                    {apiTestResult.success ? (
                                                        <CheckCircle className="w-4 h-4" />
                                                    ) : (
                                                        <XCircle className="w-4 h-4" />
                                                    )}
                                                    <span>{apiTestResult.message}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-3 space-y-2">
                                        <p className="text-sm text-neutral-500 flex items-start gap-2">
                                            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
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
                                        <p className="text-xs text-amber-600 pl-6 font-medium">
                                            Note: Google's image generation models (Imagen) have very limited availability. Most API keys currently show placeholder images. The app uses Gemini for text analysis and will generate real images when models become available in your region.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-emerald-600 to-blue-600 p-8">
                                <div className="flex items-center gap-3 text-white">
                                    <Sliders className="w-6 h-6" />
                                    <h2 className="text-2xl font-semibold">General Settings</h2>
                                </div>
                            </div>

                            <div className="p-8 space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-neutral-700 mb-3">
                                        Application Name
                                    </label>
                                    <input
                                        type="text"
                                        value={settings.appName}
                                        onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
                                        className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        placeholder="tumdah"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-neutral-700 mb-3">
                                        Max Image Generations Per Request
                                    </label>
                                    <select
                                        value={settings.maxImageGenerations}
                                        onChange={(e) => setSettings({ ...settings, maxImageGenerations: parseInt(e.target.value) })}
                                        className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    >
                                        <option value={1}>1</option>
                                        <option value={2}>2</option>
                                        <option value={3}>3</option>
                                        <option value={4}>4</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-neutral-700 mb-3">
                                        Default Image Aspect Ratio
                                    </label>
                                    <select
                                        value={settings.imageAspectRatio}
                                        onChange={(e) => setSettings({ ...settings, imageAspectRatio: e.target.value })}
                                        className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    >
                                        <option value="1:1">1:1 (Square)</option>
                                        <option value="16:9">16:9 (Widescreen)</option>
                                        <option value="9:16">9:16 (Portrait)</option>
                                        <option value="4:3">4:3 (Standard)</option>
                                        <option value="3:4">3:4 (Portrait)</option>
                                    </select>
                                </div>

                                <div className="flex items-center justify-between p-6 bg-neutral-50 rounded-xl">
                                    <div>
                                        <label className="block text-sm font-semibold text-neutral-700">
                                            Enable Storyboard Feature
                                        </label>
                                        <p className="text-sm text-neutral-500 mt-1">
                                            Allow users to create AI-generated storyboards
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setSettings({ ...settings, enableStoryboard: !settings.enableStoryboard })}
                                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                                            settings.enableStoryboard ? 'bg-blue-600' : 'bg-neutral-300'
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-lg ${
                                                settings.enableStoryboard ? 'translate-x-7' : 'translate-x-1'
                                            }`}
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button onClick={handleSave} className="px-10 py-4 text-lg shadow-xl">
                                <Save className="w-5 h-5" />
                                Save All Settings
                            </Button>
                        </div>
                    </div>
                ) : activeTab === 'analytics' ? (
                    <div className="space-y-6">
                        <ChartCard title="User Growth" subtitle="Monthly active users over time">
                            <div className="h-64 flex items-end justify-around gap-2 mt-4">
                                {[32000, 38000, 45000, 48000, 50000, 47000, 50234].map((value, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center">
                                        <div
                                            className="w-full bg-gradient-to-t from-blue-600 to-emerald-600 rounded-t-lg hover:opacity-80 transition-opacity cursor-pointer"
                                            style={{height: `${(value / 50234) * 100}%`}}
                                        ></div>
                                        <span className="text-xs text-neutral-500 mt-2">
                                            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'][i]}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </ChartCard>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ChartCard title="Top Features" subtitle="Most used features this month">
                                <div className="space-y-4 mt-4">
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm font-medium">Image Generation</span>
                                            <span className="text-sm font-bold">78%</span>
                                        </div>
                                        <div className="w-full bg-neutral-100 rounded-full h-2">
                                            <div className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full" style={{width: '78%'}}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm font-medium">Storyboards</span>
                                            <span className="text-sm font-bold">65%</span>
                                        </div>
                                        <div className="w-full bg-neutral-100 rounded-full h-2">
                                            <div className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full" style={{width: '65%'}}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm font-medium">Style Transfer</span>
                                            <span className="text-sm font-bold">52%</span>
                                        </div>
                                        <div className="w-full bg-neutral-100 rounded-full h-2">
                                            <div className="bg-gradient-to-r from-violet-500 to-pink-500 h-2 rounded-full" style={{width: '52%'}}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm font-medium">Batch Processing</span>
                                            <span className="text-sm font-bold">43%</span>
                                        </div>
                                        <div className="w-full bg-neutral-100 rounded-full h-2">
                                            <div className="bg-gradient-to-r from-orange-500 to-pink-500 h-2 rounded-full" style={{width: '43%'}}></div>
                                        </div>
                                    </div>
                                </div>
                            </ChartCard>

                            <ChartCard title="User Segments" subtitle="User distribution by plan">
                                <div className="space-y-4 mt-4">
                                    <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-neutral-200 flex items-center justify-center">
                                                <span className="font-bold text-neutral-700">F</span>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-neutral-900">Free Plan</p>
                                                <p className="text-sm text-neutral-600">32,145 users</p>
                                            </div>
                                        </div>
                                        <span className="text-2xl font-bold text-neutral-900">64%</span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                                                <span className="font-bold text-white">P</span>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-neutral-900">Professional</p>
                                                <p className="text-sm text-neutral-600">16,089 users</p>
                                            </div>
                                        </div>
                                        <span className="text-2xl font-bold text-neutral-900">32%</span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center">
                                                <span className="font-bold text-white">E</span>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-neutral-900">Enterprise</p>
                                                <p className="text-sm text-neutral-600">2,000 users</p>
                                            </div>
                                        </div>
                                        <span className="text-2xl font-bold text-neutral-900">4%</span>
                                    </div>
                                </div>
                            </ChartCard>
                        </div>
                    </div>
                ) : activeTab === 'system' ? (
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
                            <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-3">
                                <Shield className="w-6 h-6 text-emerald-600" />
                                System Health Monitor
                            </h2>
                            <div className="space-y-4">
                                {systemHealth.map((service, index) => (
                                    <div key={index} className="flex items-center justify-between p-5 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                                            <div>
                                                <p className="font-semibold text-neutral-900">{service.service}</p>
                                                <p className="text-sm text-neutral-600">{service.status}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-8">
                                            <div className="text-right">
                                                <p className="text-sm text-neutral-600">Uptime</p>
                                                <p className="font-bold text-neutral-900">{service.uptime}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-neutral-600">Response Time</p>
                                                <p className="font-bold text-neutral-900">{service.responseTime}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ChartCard title="API Performance" subtitle="Last 24 hours">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-neutral-600">Average Latency</span>
                                        <span className="text-lg font-bold text-neutral-900">124ms</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-neutral-600">Total Requests</span>
                                        <span className="text-lg font-bold text-neutral-900">1,234,567</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-neutral-600">Success Rate</span>
                                        <span className="text-lg font-bold text-emerald-600">99.8%</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-neutral-600">Error Rate</span>
                                        <span className="text-lg font-bold text-red-600">0.2%</span>
                                    </div>
                                </div>
                            </ChartCard>

                            <ChartCard title="Resource Usage" subtitle="Current utilization">
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm font-medium">CPU Usage</span>
                                            <span className="text-sm font-bold">42%</span>
                                        </div>
                                        <div className="w-full bg-neutral-100 rounded-full h-3">
                                            <div className="bg-gradient-to-r from-blue-500 to-emerald-500 h-3 rounded-full" style={{width: '42%'}}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm font-medium">Memory Usage</span>
                                            <span className="text-sm font-bold">68%</span>
                                        </div>
                                        <div className="w-full bg-neutral-100 rounded-full h-3">
                                            <div className="bg-gradient-to-r from-emerald-500 to-blue-500 h-3 rounded-full" style={{width: '68%'}}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm font-medium">Storage</span>
                                            <span className="text-sm font-bold">52%</span>
                                        </div>
                                        <div className="w-full bg-neutral-100 rounded-full h-3">
                                            <div className="bg-gradient-to-r from-violet-500 to-pink-500 h-3 rounded-full" style={{width: '52%'}}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm font-medium">Network</span>
                                            <span className="text-sm font-bold">38%</span>
                                        </div>
                                        <div className="w-full bg-neutral-100 rounded-full h-3">
                                            <div className="bg-gradient-to-r from-orange-500 to-pink-500 h-3 rounded-full" style={{width: '38%'}}></div>
                                        </div>
                                    </div>
                                </div>
                            </ChartCard>
                        </div>
                    </div>
                ) : activeTab === 'prompts' ? (
                    <div className="space-y-8">
                        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <FileText className="w-6 h-6 text-blue-600" />
                                <h2 className="text-2xl font-bold text-neutral-900">Prompt Templates Manager</h2>
                            </div>
                            <p className="text-neutral-600 mb-8">
                                Manage AI prompts for story expansion and image style generation. Users can select from these templates when creating content.
                            </p>

                            <div className="space-y-12">
                                <PromptManager
                                    category="story_expansion"
                                    title="Story Expansion Prompts"
                                    description="Templates for expanding user story ideas with AI"
                                />

                                <div className="border-t border-neutral-200 pt-12">
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
