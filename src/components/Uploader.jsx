import React from 'react';
import { Image as ImageIcon } from 'lucide-react';

export const Uploader = ({ label, onUpload, imageUrl }) => {
    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => onUpload(reader.result, file.name);
            reader.readAsDataURL(file);
        }
    };
    return (
        <div className="relative border-2 border-dashed border-neutral-300 rounded-xl sm:rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center h-32 sm:h-40 md:h-full min-h-[128px] bg-neutral-50 hover:border-primary-400 hover:bg-primary-50/50 transition-all duration-200 group cursor-pointer">
            {imageUrl ? (
                <img src={imageUrl} alt="Uploaded" className="absolute inset-0 w-full h-full object-cover rounded-xl sm:rounded-2xl" />
            ) : (
                <div className="text-center text-neutral-500 group-hover:text-primary-600 transition-colors">
                    <ImageIcon className="mx-auto h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 mb-2 sm:mb-3" />
                    <p className="font-bold text-xs sm:text-sm">{label}</p>
                </div>
            )}
            <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
        </div>
    );
};
