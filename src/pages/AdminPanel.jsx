import { useState, useEffect } from 'react';
import { Settings, Save, Key, Sliders, Info, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../components/Button';

const AdminPanel = () => {
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

    useEffect(() => {
        const savedSettings = localStorage.getItem('adminSettings');
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                setSettings(parsed);
            } catch (e) {
                console.error('Failed to load settings:', e);
            }
        }
    }, []);

    const handleSave = () => {
        try {
            localStorage.setItem('adminSettings', JSON.stringify(settings));

            if (settings.googleAiApiKey) {
                localStorage.setItem('VITE_GOOGLE_AI_API_KEY', settings.googleAiApiKey);
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

        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${settings.googleAiApiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: 'Hello' }] }]
                    })
                }
            );

            if (response.ok) {
                setApiTestResult({ success: true, message: 'API key is valid and working!' });
            } else {
                const error = await response.json();
                setApiTestResult({
                    success: false,
                    message: error?.error?.message || 'API key validation failed'
                });
            }
        } catch (error) {
            setApiTestResult({
                success: false,
                message: 'Network error. Please check your connection.'
            });
        } finally {
            setTestingApi(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 py-12 px-6">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Settings className="w-8 h-8 text-primary-600" />
                        <h1 className="text-4xl font-bold text-neutral-900">Admin Panel</h1>
                    </div>
                    <p className="text-neutral-600">Manage application settings and API configuration</p>
                </div>

                {savedStatus && (
                    <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                        savedStatus === 'success'
                            ? 'bg-primary-50 text-primary-800 border border-primary-200'
                            : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                        {savedStatus === 'success' ? (
                            <>
                                <CheckCircle className="w-5 h-5" />
                                <span>Settings saved successfully!</span>
                            </>
                        ) : (
                            <>
                                <XCircle className="w-5 h-5" />
                                <span>Failed to save settings. Please try again.</span>
                            </>
                        )}
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-primary-600 to-accent-600 p-6">
                        <div className="flex items-center gap-3 text-white">
                            <Key className="w-6 h-6" />
                            <h2 className="text-2xl font-semibold">API Configuration</h2>
                        </div>
                    </div>

                    <div className="p-8 space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                Google AI API Key
                            </label>
                            <div className="space-y-3">
                                <input
                                    type="password"
                                    value={settings.googleAiApiKey}
                                    onChange={(e) => setSettings({ ...settings, googleAiApiKey: e.target.value })}
                                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
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
                                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                                            apiTestResult.success
                                                ? 'bg-primary-50 text-primary-700'
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
                            <p className="mt-2 text-sm text-neutral-500 flex items-start gap-2">
                                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>
                                    Get your API key from{' '}
                                    <a
                                        href="https://makersuite.google.com/app/apikey"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary-600 hover:text-primary-700 underline"
                                    >
                                        Google AI Studio
                                    </a>
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden mt-6">
                    <div className="bg-gradient-to-r from-accent-600 to-primary-600 p-6">
                        <div className="flex items-center gap-3 text-white">
                            <Sliders className="w-6 h-6" />
                            <h2 className="text-2xl font-semibold">General Settings</h2>
                        </div>
                    </div>

                    <div className="p-8 space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                Application Name
                            </label>
                            <input
                                type="text"
                                value={settings.appName}
                                onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
                                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                                placeholder="tumdah"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                Max Image Generations Per Request
                            </label>
                            <select
                                value={settings.maxImageGenerations}
                                onChange={(e) => setSettings({ ...settings, maxImageGenerations: parseInt(e.target.value) })}
                                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                            >
                                <option value={1}>1</option>
                                <option value={2}>2</option>
                                <option value={3}>3</option>
                                <option value={4}>4</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                Default Image Aspect Ratio
                            </label>
                            <select
                                value={settings.imageAspectRatio}
                                onChange={(e) => setSettings({ ...settings, imageAspectRatio: e.target.value })}
                                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                            >
                                <option value="1:1">1:1 (Square)</option>
                                <option value="16:9">16:9 (Widescreen)</option>
                                <option value="9:16">9:16 (Portrait)</option>
                                <option value="4:3">4:3 (Standard)</option>
                                <option value="3:4">3:4 (Portrait)</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
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
                                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                                    settings.enableStoryboard ? 'bg-primary-600' : 'bg-neutral-300'
                                }`}
                            >
                                <span
                                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                                        settings.enableStoryboard ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <Button onClick={handleSave} icon={Save} className="px-8 py-3 text-lg">
                        Save All Settings
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
