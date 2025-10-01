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
        <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center h-full bg-gray-50 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group cursor-pointer">
            {imageUrl ? (
                <img src={imageUrl} alt="Uploaded" className="absolute inset-0 w-full h-full object-cover rounded-xl" />
            ) : (
                <div className="text-center text-gray-500 group-hover:text-blue-600 transition-colors">
                    <ImageIcon className="mx-auto h-10 w-10 mb-2" />
                    <p className="font-semibold text-sm">{label}</p>
                </div>
            )}
            <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
        </div>
    );
};
