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
    const [usingPlaceholders, setUsingPlaceholders] = useState(false);

    const generateAndSetImages = async () => {
        if (!refImage || !userFace) {
            alert("Please upload both a Style Reference and a Character Photo.");
            return;
        }
        setHumanLoading(true);
        setGeneratedImages([]);
        setUsingPlaceholders(false);

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

            const successfulImages = images.filter(img => img !== null);

            if (successfulImages.length === 0) {
                const placeholders = [
                    'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
                    'https://images.pexels.com/photos/1024311/pexels-photo-1024311.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
                    'https://images.pexels.com/photos/1898555/pexels-photo-1898555.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
                    'https://images.pexels.com/photos/1642228/pexels-photo-1642228.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750'
                ];
                setGeneratedImages(placeholders);
                setUsingPlaceholders(true);
            } else {
                setGeneratedImages(successfulImages);
                setUsingPlaceholders(false);
            }
        } catch (error) {
            console.error('Error in generateAndSetImages:', error);
            const placeholders = [
                'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
                'https://images.pexels.com/photos/1024311/pexels-photo-1024311.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
                'https://images.pexels.com/photos/1898555/pexels-photo-1898555.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
                'https://images.pexels.com/photos/1642228/pexels-photo-1642228.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750'
            ];
            setGeneratedImages(placeholders);
            setUsingPlaceholders(true);
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
        setUsingPlaceholders(false);

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

            const successfulImages = images.filter(img => img !== null);

            if (successfulImages.length === 0) {
                const placeholders = [
                    'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
                    'https://images.pexels.com/photos/1667088/pexels-photo-1667088.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
                    'https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
                    'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750'
                ];
                setGeneratedProductImages(placeholders);
                setUsingPlaceholders(true);
            } else {
                setGeneratedProductImages(successfulImages);
                setUsingPlaceholders(false);
            }
        } catch (error) {
            console.error('Error in generateAndSetProductImages:', error);
            const placeholders = [
                'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
                'https://images.pexels.com/photos/1667088/pexels-photo-1667088.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
                'https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
                'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750'
            ];
            setGeneratedProductImages(placeholders);
            setUsingPlaceholders(true);
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
        <div className="h-screen flex flex-col bg-gradient-to-br from-white to-neutral-50 overflow-hidden">
            <header className="flex-shrink-0 px-4 sm:px-6 md:px-10 py-4 sm:py-5 border-b border-neutral-200 bg-white/80 backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900">Image Studio</h2>
                        <p className="text-neutral-600 text-xs sm:text-sm mt-1">Generate studio-quality visuals with AI</p>
                    </div>
                    <div className="flex p-1.5 bg-neutral-50 rounded-xl gap-2 shadow-sm border border-neutral-200 w-full sm:w-auto">
                        <button onClick={() => setMode('human')} className={`px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold rounded-lg transition-all flex-1 sm:flex-none flex items-center justify-center gap-1.5 ${mode === 'human' ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg' : 'text-neutral-600 hover:text-neutral-900 hover:bg-white'}`}>
                            <User size={16} className="sm:w-5 sm:h-5" /> Character
                        </button>
                        <button onClick={() => setMode('product')} className={`px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold rounded-lg transition-all flex-1 sm:flex-none flex items-center justify-center gap-1.5 ${mode === 'product' ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg' : 'text-neutral-600 hover:text-neutral-900 hover:bg-white'}`}>
                            <Package size={16} className="sm:w-5 sm:h-5" /> Product
                        </button>
                    </div>
                </div>
                {usingPlaceholders && (
                    <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-2.5 sm:p-3">
                        <p className="text-xs text-blue-800 text-center">
                            <strong>Demo Mode:</strong> Configure API key in Admin panel to generate custom images.
                        </p>
                    </div>
                )}
            </header>

            {mode === 'human' && (
                <div className="flex-1 overflow-hidden p-4 sm:p-6 md:p-8">
                    <div className="h-full grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
                        <aside className="lg:col-span-1 flex flex-col gap-3 sm:gap-4">
                            <Uploader label="1. Style Reference" onUpload={setRefImage} imageUrl={refImage} />
                            <Uploader label="2. Character Photo" onUpload={setUserFace} imageUrl={userFace} />
                            <Button onClick={generateAndSetImages} className="w-full" disabled={humanLoading}>
                                {humanLoading ? <LoadingSpinner/> : <> <Sparkles className="h-4 w-4 sm:h-5 sm:w-5"/> Generate </>}
                            </Button>
                        </aside>
                        <main className="lg:col-span-3 flex flex-col min-h-0">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 h-full overflow-y-auto">
                            {humanLoading && [...Array(4)].map((_, i) => <div key={i} className="aspect-video bg-gradient-to-br from-neutral-100 to-neutral-50 rounded-xl sm:rounded-2xl flex items-center justify-center border border-neutral-200 shadow-sm"><LoadingSpinner/></div>)}

                            {!humanLoading && generatedImages.length > 0 && generatedImages.map((src, index) => (
                                <div key={index} className="relative group cursor-pointer" onClick={() => setFullscreenImage(src)}>
                                    <img src={src} alt={`Generated ${index + 1}`} className="w-full h-full object-cover rounded-xl sm:rounded-2xl aspect-video border border-neutral-200 shadow-sm" />
                                    <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center gap-2 sm:gap-4 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl sm:rounded-2xl touch-none pointer-events-none group-hover:pointer-events-auto">
                                        <Button variant="secondary" onClick={(e) => { e.stopPropagation(); setFullscreenImage(src); }} className="bg-white text-gray-900 hover:bg-gray-100 text-xs sm:text-sm py-1.5 px-3 sm:py-2 sm:px-4 pointer-events-auto"><ZoomIn className="h-4 w-4 sm:h-5 sm:w-5"/></Button>
                                        <Button variant="secondary" onClick={(e) => { e.stopPropagation(); handleDownloadImage(src, index); }} className="bg-white text-gray-900 hover:bg-gray-100 text-xs sm:text-sm py-1.5 px-3 sm:py-2 sm:px-4 pointer-events-auto"><Download className="h-4 w-4 sm:h-5 sm:w-5"/></Button>
                                    </div>
                                    <div className="sm:hidden absolute bottom-2 right-2 flex gap-2">
                                        <button onClick={(e) => { e.stopPropagation(); setFullscreenImage(src); }} className="bg-white text-gray-900 p-2 rounded-lg shadow-lg"><ZoomIn className="h-4 w-4"/></button>
                                        <button onClick={(e) => { e.stopPropagation(); handleDownloadImage(src, index); }} className="bg-white text-gray-900 p-2 rounded-lg shadow-lg"><Download className="h-4 w-4"/></button>
                                    </div>
                                </div>
                            ))}

                            {!humanLoading && generatedImages.length === 0 && (
                                <div className="sm:col-span-2 flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-xl sm:rounded-2xl text-neutral-400 border-2 border-dashed border-neutral-300 min-h-[200px]">
                                    <div className="text-center">
                                        <ImageIcon className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-2 sm:mb-3"/>
                                        <p className="text-sm sm:text-base font-bold px-4">Generated images appear here</p>
                                    </div>
                                </div>
                            )}
                            </div>
                            {generatedImages.length > 0 && !humanLoading && (
                                <div className="flex justify-center mt-3 sm:mt-4 flex-shrink-0">
                                    <Button onClick={generateAndSetImages} disabled={humanLoading} variant="secondary" size="sm">Regenerate All</Button>
                                </div>
                            )}
                        </main>
                    </div>
                </div>
            )}

            {mode === 'product' && (
                <div className="flex-1 overflow-hidden p-4 sm:p-6 md:p-8">
                    <div className="h-full grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
                        <aside className="lg:col-span-1 flex flex-col gap-3 sm:gap-4">
                            <Uploader label="1. Style Reference" onUpload={setProductStyleRef} imageUrl={productStyleRef} />
                            <Uploader label="2. Product Photo" onUpload={setProductPhoto} imageUrl={productPhoto} />
                            <Button onClick={generateAndSetProductImages} className="w-full" disabled={productLoading}>
                                {productLoading ? <LoadingSpinner/> : <> <Sparkles className="h-4 w-4 sm:h-5 sm:w-5"/> Generate </>}
                            </Button>
                        </aside>
                        <main className="lg:col-span-3 flex flex-col min-h-0">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 h-full overflow-y-auto">
                            {productLoading && [...Array(4)].map((_, i) => <div key={i} className="aspect-video bg-gradient-to-br from-neutral-100 to-neutral-50 rounded-xl sm:rounded-2xl flex items-center justify-center border border-neutral-200 shadow-sm"><LoadingSpinner/></div>)}

                            {!productLoading && generatedProductImages.length > 0 && generatedProductImages.map((src, index) => (
                                <div key={index} className="relative group cursor-pointer" onClick={() => setFullscreenImage(src)}>
                                    <img src={src} alt={`Product ${index + 1}`} className="w-full h-full object-cover rounded-xl sm:rounded-2xl aspect-video border border-gray-200" />
                                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center gap-2 sm:gap-4 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl touch-none pointer-events-none group-hover:pointer-events-auto">
                                        <Button variant="secondary" onClick={(e) => { e.stopPropagation(); setFullscreenImage(src); }} className="bg-white text-gray-900 hover:bg-gray-100 text-xs sm:text-sm py-1.5 px-3 sm:py-2 sm:px-4 pointer-events-auto"><ZoomIn className="h-4 w-4 sm:h-5 sm:w-5"/></Button>
                                        <Button variant="secondary" onClick={(e) => { e.stopPropagation(); handleDownloadImage(src, index); }} className="bg-white text-gray-900 hover:bg-gray-100 text-xs sm:text-sm py-1.5 px-3 sm:py-2 sm:px-4 pointer-events-auto"><Download className="h-4 w-4 sm:h-5 sm:w-5"/></Button>
                                    </div>
                                    <div className="sm:hidden absolute bottom-2 right-2 flex gap-2">
                                        <button onClick={(e) => { e.stopPropagation(); setFullscreenImage(src); }} className="bg-white text-gray-900 p-2 rounded-lg shadow-lg"><ZoomIn className="h-4 w-4"/></button>
                                        <button onClick={(e) => { e.stopPropagation(); handleDownloadImage(src, index); }} className="bg-white text-gray-900 p-2 rounded-lg shadow-lg"><Download className="h-4 w-4"/></button>
                                    </div>
                                </div>
                            ))}

                            {!productLoading && generatedProductImages.length === 0 && (
                                <div className="sm:col-span-2 flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-xl sm:rounded-2xl text-neutral-400 border-2 border-dashed border-neutral-300 min-h-[200px]">
                                    <div className="text-center">
                                        <Package className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-2 sm:mb-3"/>
                                        <p className="text-sm sm:text-base font-bold px-4">Product shots appear here</p>
                                    </div>
                                </div>
                            )}
                            </div>
                            {generatedProductImages.length > 0 && !productLoading && (
                                <div className="flex justify-center mt-3 sm:mt-4 flex-shrink-0">
                                    <Button onClick={generateAndSetProductImages} disabled={productLoading} variant="secondary" size="sm">Regenerate All</Button>
                                </div>
                            )}
                        </main>
                    </div>
                </div>
            )}

            {fullscreenImage && createPortal(<div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setFullscreenImage(null)}><button className="absolute top-4 right-4 text-white hover:text-gray-300" onClick={() => setFullscreenImage(null)}><X size={32}/></button><img src={fullscreenImage} alt="Fullscreen" className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" /></div>, document.body)}
        </div>
    );
};
