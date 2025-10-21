import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check, X, Star } from 'lucide-react';
import { Button } from './Button';

const PromptManager = ({ category, title, description }) => {
    const [prompts, setPrompts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ label: '', prompt: '' });
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newForm, setNewForm] = useState({ name: '', label: '', prompt: '' });

    useEffect(() => {
        loadPrompts();
    }, [category]);

    const loadPrompts = async () => {
        try {
            setLoading(true);
            const { supabase } = await import('../utils/supabase');
            const { data, error } = await supabase
                .from('prompt_templates')
                .select('*')
                .eq('category', category)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setPrompts(data || []);
        } catch (error) {
            console.error('Error loading prompts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (id) => {
        try {
            const { supabase } = await import('../utils/supabase');
            const { error } = await supabase
                .from('prompt_templates')
                .update({
                    label: editForm.label,
                    prompt: editForm.prompt
                })
                .eq('id', id);

            if (error) throw error;
            setEditingId(null);
            loadPrompts();
        } catch (error) {
            console.error('Error updating prompt:', error);
            alert('Failed to update prompt');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this prompt template?')) return;

        try {
            const { supabase } = await import('../utils/supabase');
            const { error } = await supabase
                .from('prompt_templates')
                .delete()
                .eq('id', id);

            if (error) throw error;
            loadPrompts();
        } catch (error) {
            console.error('Error deleting prompt:', error);
            alert('Failed to delete prompt');
        }
    };

    const handleSetDefault = async (id) => {
        try {
            const { supabase } = await import('../utils/supabase');

            await supabase
                .from('prompt_templates')
                .update({ is_default: false })
                .eq('category', category);

            const { error } = await supabase
                .from('prompt_templates')
                .update({ is_default: true })
                .eq('id', id);

            if (error) throw error;
            loadPrompts();
        } catch (error) {
            console.error('Error setting default:', error);
            alert('Failed to set default prompt');
        }
    };

    const handleToggleActive = async (id, currentStatus) => {
        try {
            const { supabase } = await import('../utils/supabase');
            const { error } = await supabase
                .from('prompt_templates')
                .update({ is_active: !currentStatus })
                .eq('id', id);

            if (error) throw error;
            loadPrompts();
        } catch (error) {
            console.error('Error toggling active status:', error);
            alert('Failed to update prompt status');
        }
    };

    const handleAddNew = async () => {
        if (!newForm.name || !newForm.label || !newForm.prompt) {
            alert('Please fill in all fields');
            return;
        }

        try {
            const { supabase } = await import('../utils/supabase');
            const { error } = await supabase
                .from('prompt_templates')
                .insert([{
                    name: newForm.name,
                    category: category,
                    label: newForm.label,
                    prompt: newForm.prompt,
                    is_active: true,
                    is_default: false
                }]);

            if (error) throw error;
            setIsAddingNew(false);
            setNewForm({ name: '', label: '', prompt: '' });
            loadPrompts();
        } catch (error) {
            console.error('Error adding prompt:', error);
            alert('Failed to add prompt. Make sure the name is unique.');
        }
    };

    const startEdit = (prompt) => {
        setEditingId(prompt.id);
        setEditForm({
            label: prompt.label,
            prompt: prompt.prompt
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-neutral-900">{title}</h3>
                    <p className="text-sm text-neutral-600 mt-1">{description}</p>
                </div>
                <Button
                    onClick={() => setIsAddingNew(true)}
                    className="flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add New
                </Button>
            </div>

            {isAddingNew && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">
                            Template Name (unique identifier)
                        </label>
                        <input
                            type="text"
                            value={newForm.name}
                            onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., style_noir"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">
                            Display Label
                        </label>
                        <input
                            type="text"
                            value={newForm.label}
                            onChange={(e) => setNewForm({ ...newForm, label: e.target.value })}
                            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Film Noir"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">
                            Prompt Template
                        </label>
                        <textarea
                            value={newForm.prompt}
                            onChange={(e) => setNewForm({ ...newForm, prompt: e.target.value })}
                            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-32"
                            placeholder="Enter the prompt template..."
                        />
                    </div>
                    <div className="flex gap-3">
                        <Button onClick={handleAddNew}>
                            <Check className="w-4 h-4" />
                            Create Template
                        </Button>
                        <Button
                            onClick={() => {
                                setIsAddingNew(false);
                                setNewForm({ name: '', label: '', prompt: '' });
                            }}
                            variant="outline"
                        >
                            <X className="w-4 h-4" />
                            Cancel
                        </Button>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {prompts.map((prompt) => (
                    <div
                        key={prompt.id}
                        className={`border rounded-xl p-6 transition-all ${
                            prompt.is_default
                                ? 'border-emerald-300 bg-emerald-50'
                                : prompt.is_active
                                ? 'border-neutral-200 bg-white'
                                : 'border-neutral-200 bg-neutral-50 opacity-60'
                        }`}
                    >
                        {editingId === prompt.id ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                        Display Label
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.label}
                                        onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                        Prompt Template
                                    </label>
                                    <textarea
                                        value={editForm.prompt}
                                        onChange={(e) => setEditForm({ ...editForm, prompt: e.target.value })}
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-32"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <Button onClick={() => handleUpdate(prompt.id)}>
                                        <Check className="w-4 h-4" />
                                        Save
                                    </Button>
                                    <Button onClick={() => setEditingId(null)} variant="outline">
                                        <X className="w-4 h-4" />
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <h4 className="text-lg font-bold text-neutral-900">{prompt.label}</h4>
                                        {prompt.is_default && (
                                            <span className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full flex items-center gap-1">
                                                <Star className="w-3 h-3 fill-current" />
                                                DEFAULT
                                            </span>
                                        )}
                                        <span className="text-sm text-neutral-500">({prompt.name})</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleToggleActive(prompt.id, prompt.is_active)}
                                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                                                prompt.is_active
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'bg-neutral-200 text-neutral-600'
                                            }`}
                                        >
                                            {prompt.is_active ? 'Active' : 'Inactive'}
                                        </button>
                                        {!prompt.is_default && prompt.is_active && (
                                            <button
                                                onClick={() => handleSetDefault(prompt.id)}
                                                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                                                title="Set as default"
                                            >
                                                <Star className="w-4 h-4 text-neutral-400 hover:text-emerald-600" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => startEdit(prompt)}
                                            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4 text-neutral-600" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(prompt.id)}
                                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-600" />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-sm text-neutral-700 bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                                    {prompt.prompt}
                                </p>
                            </div>
                        )}
                    </div>
                ))}

                {prompts.length === 0 && (
                    <div className="text-center py-12 bg-neutral-50 rounded-xl border-2 border-dashed border-neutral-300">
                        <p className="text-neutral-600">No prompt templates yet. Click "Add New" to create one.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PromptManager;
