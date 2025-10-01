import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Camera } from 'lucide-react';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { callApi } from '../utils/api';

const ShotCardV2 = ({ scene, shot, shotId, generationState, onRegenerate, onShotUpdate }) => {
    const { isLoading, url } = generationState || { isLoading: false, url: null };

    const shotTypes = ["Extreme Close-Up", "Close-Up", "Medium Shot", "Cowboy Shot", "Full Shot", "Wide Shot", "Establishing Shot", "Over-the-Shoulder"];
    const lensChoices = ["14mm Ultra-Wide", "24mm Wide-Angle", "35mm Wide", "50mm Standard", "85mm Prime", "135mm Telephoto"];
    const cameraMovements = ["Static", "Pan", "Tilt", "Dolly In", "Dolly Out", "Crane Shot", "Handheld", "Steadicam"];

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
            <div className="w-full aspect-video bg-gray-100 flex items-center justify-center relative group">
                {isLoading ? <LoadingSpinner /> : (url ? <img src={url} alt={shot.shot_type} className="w-full h-full object-cover" /> : <div className="text-gray-300"><Camera size={48}/></div>)}
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="secondary" onClick={() => onRegenerate(shotId, scene, shot)} disabled={isLoading} className="text-xs py-2 px-4 bg-white text-gray-900">
                        {isLoading ? <LoadingSpinner className="h-4 w-4"/> : "Regenerate"}
                    </Button>
                </div>
            </div>
            <div className="p-4 flex-1 flex flex-col">
                <p className="text-gray-600 text-sm mb-4 flex-grow leading-relaxed">{shot.caption}</p>
                <div className="space-y-3 text-sm border-t border-gray-200 pt-3 mt-3">
                    <div className="grid grid-cols-3 items-center gap-2">
                        <label className="text-gray-500 font-medium col-span-1 text-xs">Shot</label>
                        <select value={shot.shot_type} onChange={(e) => onShotUpdate(shotId, { ...shot, shot_type: e.target.value })} className="bg-gray-50 border border-gray-300 rounded px-2 py-1.5 col-span-2 outline-none focus:ring-2 focus:ring-blue-500 text-xs">
                            {shotTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-2">
                         <label className="text-gray-500 font-medium col-span-1 text-xs">Lens</label>
                        <select value={shot.lens_choice} onChange={(e) => onShotUpdate(shotId, { ...shot, lens_choice: e.target.value })} className="bg-gray-50 border border-gray-300 rounded px-2 py-1.5 col-span-2 outline-none focus:ring-2 focus:ring-blue-500 text-xs">
                            {lensChoices.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-2">
                        <label className="text-gray-500 font-medium col-span-1 text-xs">Move</label>
                        <select value={shot.camera_movement} onChange={(e) => onShotUpdate(shotId, { ...shot, camera_movement: e.target.value })} className="bg-gray-50 border border-gray-300 rounded px-2 py-1.5 col-span-2 outline-none focus:ring-2 focus:ring-blue-500 text-xs">
                            {cameraMovements.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const StoryboardPage = ({ onNavigate }) => {
    const [story, setStory] = useState("");
    const [storyboardData, setStoryboardData] = useState(null);
    const [workflowStage, setWorkflowStage] = useState('script');
    const [loading, setLoading] = useState(false);
    const [isGeneratingShots, setIsGeneratingShots] = useState(false);
    const [shotGenerationState, setShotGenerationState] = useState({});
    const [visualStyle, setVisualStyle] = useState("Cinematic, photorealistic, high-budget film aesthetic.");
    const [characterProfiles, setCharacterProfiles] = useState({});

    const handleParseStory = async () => {
        if (story.trim() === "") return;
        setLoading(true);
        const data = await callApi('/parse_story', { story });
        if (data && data.cast_refs) {
            setStoryboardData(data);
            const initialProfiles = Object.entries(data.cast_refs).reduce((acc, [key, val]) => {
                acc[key] = { ...val, detailed_description: val.description };
                return acc;
            }, {});
            setCharacterProfiles(initialProfiles);
            setWorkflowStage('blueprint');
        } else {
            alert("Failed to parse the story. Please try again.");
        }
        setLoading(false);
    };

    const handleCharacterUpdate = (name, newDescription) => {
        setCharacterProfiles(prev => ({...prev, [name]: {...prev[name], detailed_description: newDescription }}));
    };

    const handleFinalizeBlueprint = () => {
        setWorkflowStage('board');
        generateAllShots();
    };

    const createCinematicPrompt = (scene, shot) => {
        const characterName = Object.keys(characterProfiles).find(name => new RegExp(`\\b${name}\\b`, 'i').test(shot.caption));
        const characterDescription = characterName ? characterProfiles[characterName].detailed_description : 'A person';

        return `Create a single, cinematic frame based on the following professional specifications.
- **GLOBAL STYLE:** ${visualStyle}.
- **SUBJECT & ACTION:** The subject is ${characterDescription}. They are performing this action: ${shot.caption}.
- **SCENE CONTEXT:** Location: ${scene.location}. Mood: ${scene.mood}. Key Elements: ${scene.description}.
- **CINEMATOGRAPHY:** Shot Type: ${shot.shot_type}. Lens: ${shot.lens_choice}. Aperture: ${shot.aperture}.
- **LIGHTING & COLOR:** Lighting Style: ${scene.lighting_setup}. Color Palette: ${scene.color_palette}.
The final image must be of impeccable, film-production quality.`;
    };

    const generateAllShots = async () => {
        if (!storyboardData) return;
        setIsGeneratingShots(true);

        const allShots = [];
        storyboardData.scenes.forEach(scene => {
            scene.beats.forEach(beat => {
                beat.shot_recommendations.forEach((shot, shotIndex) => {
                    const shotId = `${scene.scene_title}-${shotIndex}-${Math.random()}`;
                    allShots.push({ shotId, scene, shot });
                });
            });
        });

        const initialState = allShots.reduce((acc, { shotId }) => ({...acc, [shotId]: { isLoading: true, url: null }}), {});
        setShotGenerationState(initialState);

        const shotPromises = allShots.map(({ shotId, scene, shot }) =>
            callApi('/generate_image', { prompt: createCinematicPrompt(scene, shot) })
                .then(url => setShotGenerationState(prev => ({ ...prev, [shotId]: { isLoading: false, url } })))
                .catch(err => {
                    console.error(`Failed shot ${shotId}:`, err);
                    setShotGenerationState(prev => ({ ...prev, [shotId]: { isLoading: false, url: null } }));
                })
        );

        await Promise.all(shotPromises);
        setIsGeneratingShots(false);
    };

    const regenerateShot = async (shotId, scene, shot) => {
        setShotGenerationState(prev => ({ ...prev, [shotId]: { isLoading: true, url: prev[shotId]?.url } }));
        try {
            const imageUrl = await callApi('/generate_image', { prompt: createCinematicPrompt(scene, shot) });
            setShotGenerationState(prev => ({ ...prev, [shotId]: { isLoading: false, url: imageUrl } }));
        } catch (error) {
             console.error(`Failed to regenerate shot ${shotId}:`, error);
             setShotGenerationState(prev => ({ ...prev, [shotId]: { isLoading: false, url: prev[shotId]?.url } }));
        }
    };

    const handleShotUpdate = (shotId, updatedShot) => {
        const newData = JSON.parse(JSON.stringify(storyboardData));
        let found = false;
        for (const scene of newData.scenes) {
            for (const beat of scene.beats) {
                const shotIndex = beat.shot_recommendations.findIndex(shot => shot.caption === updatedShot.caption);
                if (shotIndex !== -1) {
                    beat.shot_recommendations[shotIndex] = updatedShot;
                    found = true;
                    regenerateShot(shotId, scene, updatedShot);
                    break;
                }
            }
            if (found) break;
        }
        setStoryboardData(newData);
    };

    const handleGenerateStory = async () => {
        setLoading(true);
        setStory("Generating a new story...");
        const newStory = await callApi('/generate_story', {});
        setStory(newStory);
        setLoading(false);
    };

    if (workflowStage === 'script') {
        return (
            <div className="p-8 h-full flex flex-col max-w-3xl mx-auto my-auto text-center bg-gray-50">
                <header className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900">Storyboard Builder</h2>
                    <p className="text-gray-600 mt-2">Transform your script into a cinematic blueprint</p>
                </header>
                <textarea className="w-full h-80 bg-white border-2 border-gray-300 text-gray-900 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" value={story} onChange={(e) => setStory(e.target.value)} placeholder="Paste your story here or generate one with AI..."></textarea>
                <div className="flex justify-center mt-6 space-x-4">
                    <Button onClick={handleParseStory} disabled={loading || story.trim() === ""}>Analyze Script</Button>
                    <Button onClick={handleGenerateStory} disabled={loading} variant="secondary">Generate Story</Button>
                </div>
            </div>
        );
    }

    if (workflowStage === 'blueprint') {
        return (
            <div className="p-8 h-full flex flex-col max-w-4xl mx-auto bg-gray-50">
                <header className="mb-8 text-center">
                    <h2 className="text-3xl font-bold text-gray-900">Define Visual Style</h2>
                    <p className="text-gray-600 mt-2">Set the creative direction for your storyboard</p>
                </header>
                <div className="space-y-8">
                    <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                        <h3 className="text-xl font-semibold mb-3 text-gray-900">Visual Style</h3>
                        <p className="text-sm text-gray-600 mb-3">Describe the overall aesthetic, mood, genre, and color palette</p>
                        <input type="text" value={visualStyle} onChange={e => setVisualStyle(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                        <h3 className="text-xl font-semibold mb-3 text-gray-900">Character Profiles</h3>
                        <div className="space-y-4">
                            {Object.values(characterProfiles).map(char => (
                                <div key={char.name}>
                                    <label className="font-bold text-gray-900">{char.name}</label>
                                    <textarea value={char.detailed_description} onChange={e => handleCharacterUpdate(char.name, e.target.value)} rows="3" className="w-full mt-2 bg-gray-50 border-2 border-gray-300 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="mt-8 flex justify-center gap-4">
                     <Button onClick={() => setWorkflowStage('script')} variant="secondary"><ArrowLeft className="h-5 w-5 mr-2" /> Back</Button>
                     <Button onClick={handleFinalizeBlueprint} size="lg">Generate Storyboard <ArrowRight className="h-5 w-5 ml-2" /></Button>
                </div>
            </div>
        )
    }

    if (workflowStage === 'board') {
        return (
            <div className="p-8 h-full bg-gray-50">
                <main className="overflow-y-auto">
                     {storyboardData.scenes && storyboardData.scenes.map((scene, sceneIndex) => (
                        <div key={sceneIndex} className="mb-16">
                            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 sticky top-0 z-10 backdrop-blur-sm shadow-sm">
                              <h2 className="text-2xl font-bold mb-2 text-gray-900">Scene {sceneIndex + 1}: {scene.scene_title}</h2>
                              <p className="text-gray-600 mb-2"><strong>Location:</strong> {scene.location}</p>
                              <div className="text-sm text-gray-600 border-t border-gray-200 pt-3 mt-3 space-y-1">
                                  <p><strong>Mood:</strong> {scene.mood}</p>
                                  <p><strong>Lighting:</strong> {scene.lighting_setup}</p>
                                  <p><strong>Palette:</strong> {scene.color_palette}</p>
                              </div>
                            </div>
                            {scene.beats && scene.beats.map((beat, beatIndex) => (
                              <div key={beatIndex} className="mb-8">
                                <h3 className="text-xl font-semibold mb-4 text-blue-600 pl-4">{beat.beat_title}</h3>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {beat.shot_recommendations.map((shot, shotIndex) => {
                                        const shotId = `${scene.scene_title}-${shotIndex}-${beatIndex}-${Math.random()}`;
                                        return <ShotCardV2 key={shotId} scene={scene} shot={shot} shotId={shotId} generationState={shotGenerationState[shotId]} onRegenerate={regenerateShot} onShotUpdate={handleShotUpdate} />;
                                    })}
                                </div>
                              </div>
                            ))}
                        </div>
                    ))}
                </main>
            </div>
        );
    }
};
