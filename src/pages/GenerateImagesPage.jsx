import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, Image as ImageIcon, Sparkles, ZoomIn, User, Package } from 'lucide-react';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Uploader } from '../components/Uploader';
import { callApi } from '../utils/api';

export const GenerateImagesPage = ({ onNavigate }) => {
    const [mode, setMode] = useState('human');
    const [refImage, setRefImage] = useState(null);
    const [userFace, setUserFace] = useState(null);
    const [generatedImages, setGeneratedImages] = useState([]);
    const [humanLoading, setHumanLoading] = useState(false);
    const [fullscreenImage, setFullscreenImage] = useState(null);
    const [productStyleRef, setProductStyleRef] = useState(null);
    const [productPhoto, setProductPhoto] = useState(null);
    const [generatedProductImages, setGeneratedProductImages] = useState([]);
    const [productLoading, setProductLoading] = useState(false);

    const generateAndSetImages = async () => {
        if (!refImage || !userFace) {
            alert("Please upload both a Style Reference and a Character Photo.");
            return;
        }
        setHumanLoading(true);
        setGeneratedImages([]);

        try {
            const analysisResultRef = await callApi('/analyze_ref', { image: refImage });

            if (!analysisResultRef) {
                alert("Failed to analyze the style reference image. Please try a different image.");
                setHumanLoading(false);
                return;
            }
            const { outfit_description: refOutfit, color_palette: refColorTone, lighting_style: refLighting, camera_shot: refShot, composition: refComposition, pose: refPose, background: refBackground } = analysisResultRef;

            const prompt1_2 = `Using the person from the provided image as the subject, create a new photorealistic image.
- **New Outfit:** The person should now be wearing: ${refOutfit}.
- **Artistic Style:** The overall artistic style is determined by these details: lighting is ${refLighting}, color palette is ${refColorTone}, composition is ${refComposition}, camera shot is a ${refShot}, and the background is ${refBackground}.
- **Pose:** The subject should hold this pose: ${refPose}.
Ensure the subject's face and identity are perfectly preserved from the source image.`;

            const prompt3 = `Using the person from the provided image as the subject, create a new photorealistic image.
- **Original Outfit:** The person should remain in their original clothes.
- **Artistic Style:** The overall artistic style is determined by these details: lighting is ${refLighting}, color palette is ${refColorTone}, composition is ${refComposition}, camera shot is a ${refShot}, and the background is ${refBackground}.
- **Pose:** The subject should hold this pose: ${refPose}.
Ensure the subject's face and identity are perfectly preserved from the source image.`;

            const prompt4 = `Using the person from the provided image as the subject, create a new photorealistic image.
- **New Outfit:** The person should now be wearing: ${refOutfit}.
- **Artistic Style:** The style is defined by: lighting is ${refLighting}, color palette is ${refColorTone}, composition is ${refComposition}, camera shot is a ${refShot}, and the background is ${refBackground}.
- **New Pose:** The subject should strike a new, powerful, and dynamic high-fashion editorial pose.
Ensure the subject's face and identity are perfectly preserved from the source image.`;

            const imagePromises = [
                callApi('/generate_image', { prompt: prompt1_2, image: userFace }),
                callApi('/generate_image', { prompt: prompt1_2, image: userFace }),
                callApi('/generate_image', { prompt: prompt3, image: userFace }),
                callApi('/generate_image', { prompt: prompt4, image: userFace })
            ];

            const images = await Promise.all(imagePromises.map(p => p.catch(err => {
                console.error('Image generation failed:', err);
                return null;
            })));
            setGeneratedImages(images.filter(img => img !== null));

            if (images.every(img => img === null)) {
                alert("All image generations failed. Please check your API key and try again.");
            }
        } catch (error) {
            console.error('Error in generateAndSetImages:', error);
            alert(error.message || "An error occurred. Please check your API key and try again.");
        } finally {
            setHumanLoading(false);
        }
    };

    const generateAndSetProductImages = async () => {
        if (!productStyleRef || !productPhoto) {
            alert("Please upload both a Style Reference and a Product Photo.");
            return;
        }
        setProductLoading(true);
        setGeneratedProductImages([]);

        try {

        const basePrompt = `Task: Re-shoot the product from the first uploaded image (Product Photo) and place it seamlessly into the scene from the second uploaded image (Style Reference Photo).
- **Source Product:** The primary subject is the product in the first image. Preserve its geometry, color, texture, and identity perfectly. Do not alter the product.
- **Target Scene & Style:** The entire environment, lighting, camera angle, lens effects, and composition must be replicated from the second image.
- **Action:** The final image should look like a professional product photograph of the source product, as if it were originally shot in the target scene.`;

        const prompts = [
            `${basePrompt}\n- **Shot Angle:** Capture the product from a direct, front-on angle, matching the composition of the target scene.`,
            `${basePrompt}\n- **Shot Angle:** Capture the product from a 45-degree angled perspective, integrating it naturally into the target scene.`,
            `${basePrompt}\n- **Shot Angle:** Capture a detailed close-up (macro shot) of a key feature of the product, using the lighting and color palette from the target scene.`,
            `Task: Create a photorealistic product lifestyle shot.
- **Product:** Use the exact product from the first uploaded image (Product Photo), maintaining its shape, color, and texture perfectly.
- **Scene:** Place the product in a contextually relevant and aesthetically pleasing arrangement within the environment shown in the second uploaded image (Style Reference Photo).
- **Style:** The lighting, color palette, and overall mood must match the second image.`
        ];

            const imagePromises = prompts.map(prompt => callApi('/generate_image', { prompt, image: productPhoto, styleImage: productStyleRef }));

            const images = await Promise.all(imagePromises.map(p => p.catch(err => {
                console.error('Product image generation failed:', err);
                return null;
            })));
            setGeneratedProductImages(images.filter(img => img !== null));

            if (images.every(img => img === null)) {
                alert("All product image generations failed. Please check your API key and try again.");
            }
        } catch (error) {
            console.error('Error in generateAndSetProductImages:', error);
            alert(error.message || "An error occurred. Please check your API key and try again.");
        } finally {
            setProductLoading(false);
        }
    };

    const handleDownloadImage = (imageUrl, index) => {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `tumdah-image-${index + 1}.jpeg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-10 h-full flex flex-col bg-gradient-to-br from-white to-neutral-50">
            <header className="mb-10">
                <h2 className="text-4xl font-bold text-neutral-900 mb-3">Image Studio</h2>
                <p className="text-neutral-600 text-lg">Generate studio-quality visuals for characters or products with AI</p>
                <div className="mt-8 flex justify-center p-2 bg-white rounded-2xl space-x-3 max-w-md mx-auto shadow-sm border border-neutral-200">
                    <button onClick={() => setMode('human')} className={`px-8 py-4 text-sm font-bold rounded-xl transition-all w-1/2 flex items-center justify-center gap-2 ${mode === 'human' ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'}`}>
                        <User size={20} /> Character
                    </button>
                    <button onClick={() => setMode('product')} className={`px-8 py-4 text-sm font-bold rounded-xl transition-all w-1/2 flex items-center justify-center gap-2 ${mode === 'product' ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'}`}>
                        <Package size={20} /> Product
                    </button>
                </div>
            </header>

            {mode === 'human' && (
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <aside className="lg:col-span-1 flex flex-col gap-6">
                        <Uploader label="1. Style Reference" onUpload={setRefImage} imageUrl={refImage} />
                        <Uploader label="2. Character Photo" onUpload={setUserFace} imageUrl={userFace} />
                        <Button onClick={generateAndSetImages} className="w-full mt-auto" disabled={humanLoading} size="lg">
                            {humanLoading ? <LoadingSpinner/> : <> <Sparkles className="h-5 w-5"/> Generate </>}
                        </Button>
                    </aside>
                    <main className="lg:col-span-3">
                         <div className="grid grid-cols-2 gap-6 h-full">
                            {humanLoading && [...Array(4)].map((_, i) => <div key={i} className="aspect-video bg-gradient-to-br from-neutral-100 to-neutral-50 rounded-2xl flex items-center justify-center border border-neutral-200 shadow-sm"><LoadingSpinner/></div>)}

                            {!humanLoading && generatedImages.length > 0 && generatedImages.map((src, index) => (
                                <div key={index} className="relative group cursor-pointer" onClick={() => setFullscreenImage(src)}>
                                    <img src={src} alt={`Generated ${index + 1}`} className="w-full h-full object-cover rounded-2xl aspect-video border border-neutral-200 shadow-sm" />
                                    <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                                        <Button variant="secondary" onClick={(e) => { e.stopPropagation(); setFullscreenImage(src); }} className="bg-white text-gray-900 hover:bg-gray-100"><ZoomIn className="h-5 w-5"/></Button>
                                        <Button variant="secondary" onClick={(e) => { e.stopPropagation(); handleDownloadImage(src, index); }} className="bg-white text-gray-900 hover:bg-gray-100"><Download className="h-5 w-5"/></Button>
                                    </div>
                                </div>
                            ))}

                            {!humanLoading && generatedImages.length === 0 && (
                                <div className="col-span-2 aspect-video bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-2xl flex flex-col items-center justify-center text-neutral-400 border-2 border-dashed border-neutral-300">
                                    <ImageIcon className="h-28 w-28 mb-6"/>
                                    <p className="text-2xl font-bold">Generated images appear here</p>
                                </div>
                            )}
                        </div>
                         {generatedImages.length > 0 && !humanLoading && (
                            <div className="flex justify-center mt-6">
                                <Button onClick={generateAndSetImages} disabled={humanLoading} variant="secondary">Regenerate All</Button>
                            </div>
                        )}
                    </main>
                </div>
            )}

            {mode === 'product' && (
                 <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <aside className="lg:col-span-1 flex flex-col gap-6">
                        <Uploader label="1. Style Reference" onUpload={setProductStyleRef} imageUrl={productStyleRef} />
                        <Uploader label="2. Product Photo" onUpload={setProductPhoto} imageUrl={productPhoto} />
                        <Button onClick={generateAndSetProductImages} className="w-full mt-auto" disabled={productLoading} size="lg">
                            {productLoading ? <LoadingSpinner/> : <> <Sparkles className="h-5 w-5"/> Generate </>}
                        </Button>
                    </aside>
                    <main className="lg:col-span-3">
                         <div className="grid grid-cols-2 gap-6 h-full">
                            {productLoading && [...Array(4)].map((_, i) => <div key={i} className="aspect-video bg-gradient-to-br from-neutral-100 to-neutral-50 rounded-2xl flex items-center justify-center border border-neutral-200 shadow-sm"><LoadingSpinner/></div>)}

                            {!productLoading && generatedProductImages.length > 0 && generatedProductImages.map((src, index) => (
                                <div key={index} className="relative group cursor-pointer" onClick={() => setFullscreenImage(src)}>
                                    <img src={src} alt={`Product ${index + 1}`} className="w-full h-full object-cover rounded-xl aspect-video border border-gray-200" />
                                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                                        <Button variant="secondary" onClick={(e) => { e.stopPropagation(); setFullscreenImage(src); }} className="bg-white text-gray-900 hover:bg-gray-100"><ZoomIn className="h-5 w-5"/></Button>
                                        <Button variant="secondary" onClick={(e) => { e.stopPropagation(); handleDownloadImage(src, index); }} className="bg-white text-gray-900 hover:bg-gray-100"><Download className="h-5 w-5"/></Button>
                                    </div>
                                </div>
                            ))}

                            {!productLoading && generatedProductImages.length === 0 && (
                                <div className="col-span-2 aspect-video bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-2xl flex flex-col items-center justify-center text-neutral-400 border-2 border-dashed border-neutral-300">
                                    <Package className="h-28 w-28 mb-6"/>
                                    <p className="text-2xl font-bold">Product shots appear here</p>
                                </div>
                            )}
                        </div>
                         {generatedProductImages.length > 0 && !productLoading && (
                            <div className="flex justify-center mt-6">
                                <Button onClick={generateAndSetProductImages} disabled={productLoading} variant="secondary">Regenerate All</Button>
                            </div>
                        )}
                    </main>
                </div>
            )}

            {fullscreenImage && createPortal(<div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setFullscreenImage(null)}><button className="absolute top-4 right-4 text-white hover:text-gray-300" onClick={() => setFullscreenImage(null)}><X size={32}/></button><img src={fullscreenImage} alt="Fullscreen" className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" /></div>, document.body)}
        </div>
    );
};
